from datetime import datetime, timezone
from app.schemas import AnnotationPayload

ANNOTATIONS: list[dict] = []


def add_annotation(payload: AnnotationPayload) -> dict:
    record = payload.model_dump()
    record["created_at"] = datetime.now(timezone.utc).isoformat()
    ANNOTATIONS.append(record)
    return {"message": "stored", "count": len(ANNOTATIONS), "image_id": payload.image_id}


def get_annotations(limit: int = 20) -> dict:
    return {"total": len(ANNOTATIONS), "items": ANNOTATIONS[-limit:]}
