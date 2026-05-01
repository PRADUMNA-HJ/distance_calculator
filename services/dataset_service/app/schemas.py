from pydantic import BaseModel


class DatasetIngestPayload(BaseModel):
    source: str
    analysis_mode: str | None = None
    target_object_type: str | None = None
    dataset_name: str
    version: str
    records: int
    notes: str | None = None
