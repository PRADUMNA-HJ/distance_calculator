from fastapi.testclient import TestClient
from app.main import app
import app.store as store

client = TestClient(app)


def _use_temp_database(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(store, "DATABASE_PATH", str(tmp_path / "dataset_test.db"))


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200


def test_ingest_and_list_jobs(tmp_path, monkeypatch) -> None:
    _use_temp_database(tmp_path, monkeypatch)
    payload = {
        "source": "kaggle",
        "analysis_mode": "area",
        "target_object_type": "plot of land",
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
