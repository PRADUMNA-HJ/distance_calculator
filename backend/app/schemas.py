from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class Point(BaseModel):
    x: float
    y: float


class BoundingBox(BaseModel):
    x: float = Field(ge=0)
    y: float = Field(ge=0)
    width: float = Field(gt=0)
    height: float = Field(gt=0)


class AnnotationPayload(BaseModel):
    image_id: str
    image_uri: str
    mark_type: Literal["box", "circle", "polygon"]
    box: BoundingBox | None = None
    polygon: list[Point] | None = None
    true_distance_cm: float = Field(gt=0)
    source: Literal["kaggle", "mobile-camera"]
    captured_at: datetime | None = None


class PredictRequest(BaseModel):
    image_uri: str
    mark_type: Literal["box", "circle", "polygon"]
    box: BoundingBox | None = None
    polygon: list[Point] | None = None


class ModelInfo(BaseModel):
    model_name: str
    model_version: str
    trained_on: datetime


class PredictResponse(BaseModel):
    distance_cm: float = Field(gt=0)
    confidence: float = Field(ge=0, le=1)
    model_version: str
    label_position: Point | None = None
