from pydantic import BaseModel


class DatasetIngestPayload(BaseModel):
    source: str
    dataset_name: str
    version: str
    records: int
    notes: str | None = None
