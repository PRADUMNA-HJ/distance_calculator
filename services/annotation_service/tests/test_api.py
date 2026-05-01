from fastapi.testclient import TestClient
from app.main import app
import app.store as store

client = TestClient(app)


def _use_temp_database(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(store, "DATABASE_PATH", str(tmp_path / "annotation_test.db"))


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200


def test_create_and_list_annotation(tmp_path, monkeypatch) -> None:
    _use_temp_database(tmp_path, monkeypatch)
    payload = {
        "image_id": "img-1",
        "image_uri": "images/img-1.jpg",
        "mark_type": "box",
        "analysis_mode": "distance",
        "target_object_type": "box",
        "true_distance_cm": 85.0,
        "source": "mobile-camera",
    }
    create_response = client.post("/v1/annotations", json=payload)
    assert create_response.status_code == 201

    list_response = client.get("/v1/annotations")
    assert list_response.status_code == 200
    assert list_response.json()["total"] >= 1
