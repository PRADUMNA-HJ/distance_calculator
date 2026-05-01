from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    model_config = ConfigDict(protected_namespaces=())


class Point(BaseSchema):
    x: float
    y: float


class BoundingBox(BaseSchema):
    x: float
    y: float
    width: float
    height: float


class PredictRequest(BaseSchema):
    image_uri: str
    mark_type: str
    analysis_mode: str | None = None
    target_object_type: str | None = None
    box: BoundingBox | None = None
    polygon: list[Point] | None = None


class ModelPrediction(BaseSchema):
    distance_cm: float
    confidence: float
    model_version: str


class PredictResponse(BaseSchema):
    distance_cm: float
    confidence: float
    model_version: str
    label_position: Point
