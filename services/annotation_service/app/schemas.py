from pydantic import BaseModel, Field


class AnnotationPayload(BaseModel):
    image_id: str
    image_uri: str
    mark_type: str
    true_distance_cm: float = Field(gt=0)
    source: str
    box: dict | None = None
    polygon: list[dict] | None = None
