from fastapi import APIRouter
from app.schemas import AnnotationPayload
from app.store import add_annotation, get_annotations

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"service": "annotation_service", "status": "ok"}


@router.post("/v1/annotations", status_code=201)
def create_annotation(payload: AnnotationPayload) -> dict:
    return add_annotation(payload)


@router.get("/v1/annotations")
def list_annotations(limit: int = 20) -> dict:
    return get_annotations(limit=limit)
