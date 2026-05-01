from fastapi import APIRouter, HTTPException, Request
from pydantic import ValidationError
from app.schemas import ModelPrediction, PredictRequest, PredictResponse
from app.services.prediction_service import (
    ModelServiceError,
    build_prediction_response,
    fetch_model_prediction,
)

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"service": "inference_orchestrator", "status": "ok"}


@router.post("/v1/predict-distance", response_model=PredictResponse)
async def predict(payload: PredictRequest, request: Request) -> PredictResponse:
    request_id = request.headers.get("x-request-id")

    try:
        raw_model_result = await fetch_model_prediction(payload.model_dump(), request_id=request_id)
    except ModelServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc

    try:
        model_result = ModelPrediction.model_validate(raw_model_result)
    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail="Model service returned an invalid prediction payload.",
        ) from exc

    return build_prediction_response(payload, model_result)
