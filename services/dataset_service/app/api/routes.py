from fastapi import APIRouter
from app.schemas import DatasetIngestPayload
from app.store import add_ingest_job, list_ingest_jobs

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"service": "dataset_service", "status": "ok"}


@router.post("/v1/dataset/ingest")
def ingest(payload: DatasetIngestPayload) -> dict:
    return add_ingest_job(payload)


@router.get("/v1/dataset/jobs")
def jobs() -> dict:
    return list_ingest_jobs()
