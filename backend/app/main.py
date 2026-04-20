from datetime import datetime, timezone
from fastapi import FastAPI
from .schemas import AnnotationPayload, ModelInfo, PredictRequest, PredictResponse, Point

app = FastAPI(title="Distance Calculator API", version="0.1.0")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/v1/models/active", response_model=ModelInfo)
def active_model() -> ModelInfo:
    return ModelInfo(
        model_name="distance-baseline",
        model_version="baseline-v0",
        trained_on=datetime.now(timezone.utc),
    )


@app.post("/v1/annotations", status_code=201)
def create_annotation(payload: AnnotationPayload) -> dict:
    # Skeleton response. Persist to DB or CSV in next phase.
    return {
        "message": "annotation accepted",
        "image_id": payload.image_id,
        "source": payload.source,
    }


@app.post("/v1/predict-distance", response_model=PredictResponse)
def predict_distance(payload: PredictRequest) -> PredictResponse:
    # Placeholder until ML service integration.
    return PredictResponse(
        distance_cm=72.0,
        confidence=0.61,
        model_version="baseline-v0",
        label_position=Point(x=payload.box.x if payload.box else 20, y=payload.box.y if payload.box else 20),
    )
