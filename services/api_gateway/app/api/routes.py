from fastapi import APIRouter, Header, Request
import httpx
from app.core.config import ANNOTATION_SERVICE_URL, DATASET_SERVICE_URL, INFERENCE_SERVICE_URL
from app.core.middleware import get_or_create_request_id
from app.core.security import verify_token

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"service": "api_gateway", "status": "ok"}


@router.post("/api/v1/annotations")
async def create_annotation(
    payload: dict,
    request: Request,
    authorization: str | None = Header(default=None),
) -> dict:
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
    authorization: str | None = Header(default=None),
) -> dict:
    await verify_token(authorization)
    request_id = get_or_create_request_id(request)
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
    authorization: str | None = Header(default=None),
) -> dict:
    await verify_token(authorization)
    request_id = get_or_create_request_id(request)
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            f"{DATASET_SERVICE_URL}/v1/dataset/ingest",
            json=payload,
            headers={"x-request-id": request_id},
        )
    return response.json()
