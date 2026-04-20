from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200


def test_ingest_and_list_jobs() -> None:
    payload = {
        "source": "kaggle",
        "dataset_name": "distance-sample",
        "version": "v1",
        "records": 100,
    }
    ingest_response = client.post("/v1/dataset/ingest", json=payload)
    assert ingest_response.status_code == 200
    assert "job_id" in ingest_response.json()

    jobs_response = client.get("/v1/dataset/jobs")
    assert jobs_response.status_code == 200
    assert jobs_response.json()["total"] >= 1
