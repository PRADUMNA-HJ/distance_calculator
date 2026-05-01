import json
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
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./data/uploads"))


async def _save_upload_file(upload_file: UploadFile) -> str:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    suffix = Path(upload_file.filename or "image.jpg").suffix or ".jpg"
    file_name = f"{uuid4().hex}{suffix}"
    file_path = UPLOAD_DIR / file_name
    file_bytes = await upload_file.read()
    file_path.write_bytes(file_bytes)
    return str(file_path).replace("\\", "/")


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
                    services[service_name] = {
                        "status": "ok",
                        "code": response.status_code,
                    }
                else:
                    services[service_name] = {
                        "status": "down",
                        "code": response.status_code,
                    }
                    overall_status = "degraded"
            except httpx.HTTPError:
                services[service_name] = {
                    "status": "down",
                    "code": None,
                }
                overall_status = "degraded"

    return {
        "service": "api_gateway",
        "status": overall_status,
        "services": services,
    }


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
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            f"{ANNOTATION_SERVICE_URL}/v1/annotations",
            json=payload,
            headers={"x-request-id": request_id},
        )
    return response.json()


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
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            f"{INFERENCE_SERVICE_URL}/v1/predict-distance",
            json=payload,
            headers={"x-request-id": request_id},
        )
    return response.json()



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

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            f"{INFERENCE_SERVICE_URL}/v1/predict-distance",
            json=payload,
            headers={"x-request-id": request_id},
        )

    return response.json()


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
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            f"{DATASET_SERVICE_URL}/v1/dataset/ingest",
            json=payload,
            headers={"x-request-id": request_id},
        )
    return response.json()
