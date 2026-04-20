from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"service": "model_service", "status": "ok"}


@router.get("/v1/model/active")
def active_model() -> dict:
    return {
        "model_name": "distance-regressor",
        "model_version": "baseline-v0",
        "framework": "pytorch",
    }


@router.post("/v1/model/predict")
def predict(payload: dict) -> dict:
    return {
        "distance_cm": 74.3,
        "confidence": 0.67,
        "model_version": "baseline-v0",
    }
