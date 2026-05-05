import json
import logging
import os
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Form, Header, HTTPException, Request, UploadFile
import httpx
from app.core.config import (
    AUTH_SERVICE_URL,
    ANNOTATION_SERVICE_URL,
    DATASET_SERVICE_URL,
    INFERENCE_SERVICE_URL,
    MODEL_SERVICE_URL,
)
from app.core.middleware import get_or_create_request_id
from app.core.security import verify_api_key, verify_token

router = APIRouter()
logger = logging.getLogger("api_gateway.routes")

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./data/uploads"))
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "10")) * 1024 * 1024


# ─── Helpers ──────────────────────────────────────────────────────────────────

async def _save_upload_file(upload_file: UploadFile) -> str:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    suffix = Path(upload_file.filename or "image.jpg").suffix or ".jpg"
    file_name = f"{uuid4().hex}{suffix}"
    file_path = UPLOAD_DIR / file_name
    file_bytes = await upload_file.read()

    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Upload exceeds {os.getenv('MAX_UPLOAD_MB', '10')} MB limit.",
        )

    file_path.write_bytes(file_bytes)
    logger.info("Saved upload: %s (%d bytes)", file_path, len(file_bytes))
    return str(file_path).replace("\\", "/")


async def _proxy_post(url: str, payload: dict, request_id: str, timeout: float = 20.0) -> dict:
    """Forward a JSON POST and propagate HTTP errors back to the caller."""
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(url, json=payload, headers={"x-request-id": request_id})
    except httpx.TimeoutException:
        logger.error("Upstream timeout calling %s", url)
        raise HTTPException(status_code=504, detail=f"Upstream service timed out: {url}")
    except httpx.RequestError as exc:
        logger.error("Upstream connection error calling %s: %s", url, exc)
        raise HTTPException(status_code=502, detail=f"Could not reach upstream service: {url}")

    if resp.status_code >= 400:
        logger.warning("Upstream %s returned %d: %s", url, resp.status_code, resp.text[:200])
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/health")
def health() -> dict:
    return {"service": "api_gateway", "status": "ok"}


@router.get("/api/v1/system/health")
async def system_health() -> dict:
    targets = {
        "annotation_service": f"{ANNOTATION_SERVICE_URL}/health",
        "inference_orchestrator": f"{INFERENCE_SERVICE_URL}/health",
        "model_service": f"{MODEL_SERVICE_URL}/health",
        "dataset_service": f"{DATASET_SERVICE_URL}/health",
    }

    services: dict[str, dict] = {}
    overall_status = "ok"
    async with httpx.AsyncClient(timeout=5.0) as client:
        for service_name, url in targets.items():
            try:
                response = await client.get(url)
                if response.status_code == 200:
                    services[service_name] = {"status": "ok", "code": response.status_code}
                else:
                    services[service_name] = {"status": "down", "code": response.status_code}
                    overall_status = "degraded"
            except httpx.HTTPError:
                services[service_name] = {"status": "down", "code": None}
                overall_status = "degraded"

    logger.info("System health check: %s", overall_status)
    return {"service": "api_gateway", "status": overall_status, "services": services}


@router.post("/api/v1/login")
async def login(payload: dict) -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(f"{AUTH_SERVICE_URL}/v1/login", json=payload)

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()


@router.get("/api/v1/models/active")
async def models_active(
    request: Request,
    x_api_key: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> dict:
    verify_api_key(x_api_key)
    await verify_token(authorization)
    request_id = get_or_create_request_id(request)
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{MODEL_SERVICE_URL}/v1/model/active",
            headers={"x-request-id": request_id},
        )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()


@router.post("/api/v1/annotations")
async def create_annotation(
    payload: dict,
    request: Request,
    x_api_key: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> dict:
    verify_api_key(x_api_key)
    await verify_token(authorization)
    request_id = get_or_create_request_id(request)

    # Validate required fields
    for field in ("image_id", "image_uri", "mark_type", "true_distance_cm", "source"):
        if field not in payload:
            raise HTTPException(status_code=422, detail=f"Missing required field: {field}")

    true_dist = payload.get("true_distance_cm", 0)
    if not isinstance(true_dist, (int, float)) or true_dist <= 0:
        raise HTTPException(status_code=422, detail="true_distance_cm must be a positive number")

    logger.info(
        "Annotation request: image_id=%s mark_type=%s request_id=%s",
        payload.get("image_id"), payload.get("mark_type"), request_id,
    )
    return await _proxy_post(f"{ANNOTATION_SERVICE_URL}/v1/annotations", payload, request_id)


@router.post("/api/v1/predict-distance")
async def predict_distance(
    payload: dict,
    request: Request,
    x_api_key: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> dict:
    verify_api_key(x_api_key)
    await verify_token(authorization)
    request_id = get_or_create_request_id(request)

    for field in ("image_uri", "mark_type"):
        if field not in payload:
            raise HTTPException(status_code=422, detail=f"Missing required field: {field}")

    mark_type = payload.get("mark_type", "")
    if mark_type not in ("box", "circle", "polygon"):
        raise HTTPException(status_code=422, detail=f"Invalid mark_type: {mark_type!r}")

    if mark_type in ("box", "circle") and not payload.get("box"):
        raise HTTPException(status_code=422, detail="box coordinates required for box/circle mark_type")

    if mark_type == "polygon":
        polygon = payload.get("polygon") or []
        if len(polygon) < 3:
            raise HTTPException(status_code=422, detail="polygon must have at least 3 points")

    logger.info(
        "Prediction request: mark_type=%s request_id=%s",
        mark_type, request_id,
    )
    return await _proxy_post(f"{INFERENCE_SERVICE_URL}/v1/predict-distance", payload, request_id)


@router.post("/api/v1/predict-distance/upload")
async def predict_distance_upload(
    request: Request,
    image_file: UploadFile = File(...),
    annotation_json: str = Form(...),
    x_api_key: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> dict:
    verify_api_key(x_api_key)
    await verify_token(authorization)
    request_id = get_or_create_request_id(request)

    try:
        payload = json.loads(annotation_json)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid annotation_json payload") from exc

    saved_image_uri = await _save_upload_file(image_file)
    payload["image_uri"] = saved_image_uri

    logger.info("Upload prediction: saved=%s request_id=%s", saved_image_uri, request_id)
    return await _proxy_post(f"{INFERENCE_SERVICE_URL}/v1/predict-distance", payload, request_id)


@router.post("/api/v1/dataset/ingest")
async def ingest_dataset(
    payload: dict,
    request: Request,
    x_api_key: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> dict:
    verify_api_key(x_api_key)
    await verify_token(authorization)
    request_id = get_or_create_request_id(request)

    for field in ("source", "dataset_name", "version", "records"):
        if field not in payload:
            raise HTTPException(status_code=422, detail=f"Missing required field: {field}")

    records = payload.get("records", 0)
    if not isinstance(records, int) or records <= 0:
        raise HTTPException(status_code=422, detail="records must be a positive integer")

    logger.info(
        "Dataset ingest: dataset=%s version=%s records=%d request_id=%s",
        payload.get("dataset_name"), payload.get("version"), records, request_id,
    )
    return await _proxy_post(f"{DATASET_SERVICE_URL}/v1/dataset/ingest", payload, request_id)
