from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.predictor import predictor
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class Box(BaseModel):
    x: float
    y: float
    width: float
    height: float

class PredictionRequest(BaseModel):
    image_uri: str
    mark_type: str
    box: Optional[Box] = None
    polygon: Optional[list] = None

@router.get("/health")
def health() -> dict:
    return {"service": "model_service", "status": "ok"}


@router.get("/v1/model/active")
def active_model() -> dict:
    info = predictor.get_model_info()
    return {
        "model_name": info.get("model_name", "distance-regressor"),
        "model_version": info.get("model_version", "baseline-v0"),
        "trained_on": datetime.now(timezone.utc).isoformat(),
        "framework": info.get("framework", "unknown"),
        "status": info.get("status", "ok")
    }


@router.post("/v1/model/predict")
def predict(payload: PredictionRequest) -> dict:
    if payload.mark_type == "box" and payload.box:
        box = payload.box
        try:
            return predictor.predict(
                mark_type="box",
                box_x=box.x,
                box_y=box.y,
                box_width=box.width,
                box_height=box.height
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    elif payload.mark_type == "polygon" and payload.polygon:
        # Simple bounding box approximation for polygon for the baseline model
        xs = [p.get("x") for p in payload.polygon if "x" in p]
        ys = [p.get("y") for p in payload.polygon if "y" in p]
        if not xs or not ys:
            raise HTTPException(status_code=400, detail="Invalid polygon data")
            
        box_x = min(xs)
        box_y = min(ys)
        box_width = max(xs) - box_x
        box_height = max(ys) - box_y
        
        try:
            return predictor.predict(
                mark_type="polygon",
                box_x=box_x,
                box_y=box_y,
                box_width=box_width,
                box_height=box_height
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    elif payload.mark_type == "circle" and payload.box:
        box = payload.box
        try:
            return predictor.predict(
                mark_type="circle",
                box_x=box.x,
                box_y=box.y,
                box_width=box.width,
                box_height=box.height
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    # Fallback if no matching geometry
    return {
        "distance_cm": 74.3,
        "confidence": 0.67,
        "model_version": "baseline-v0",
    }
