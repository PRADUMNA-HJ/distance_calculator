from fastapi import APIRouter
from app.services.prediction_service import build_prediction_response, fetch_model_prediction

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"service": "inference_orchestrator", "status": "ok"}


@router.post("/v1/predict-distance")
async def predict(payload: dict) -> dict:
    model_result = await fetch_model_prediction(payload)
    return build_prediction_response(payload, model_result)
