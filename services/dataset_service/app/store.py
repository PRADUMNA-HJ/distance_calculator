from datetime import datetime, timezone
from app.schemas import DatasetIngestPayload

INGEST_JOBS: list[dict] = []


def add_ingest_job(payload: DatasetIngestPayload) -> dict:
    job = payload.model_dump()
    job["ingested_at"] = datetime.now(timezone.utc).isoformat()
    job["job_id"] = f"ingest-{len(INGEST_JOBS) + 1}"
    INGEST_JOBS.append(job)
    return {"message": "ingest accepted", "job_id": job["job_id"]}


def list_ingest_jobs() -> dict:
    return {"total": len(INGEST_JOBS), "items": INGEST_JOBS}
