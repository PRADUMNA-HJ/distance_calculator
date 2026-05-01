from fastapi.testclient import TestClient
from app.main import app
from app.api import routes
from app.services.prediction_service import ModelServiceError

client = TestClient(app)


async def fake_fetch_model_prediction(payload: dict, request_id: str | None = None) -> dict:
    return {"distance_cm": 42.0, "confidence": 0.9, "model_version": "test-v1"}


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200


def test_predict_with_mocked_model(monkeypatch) -> None:
    monkeypatch.setattr(routes, "fetch_model_prediction", fake_fetch_model_prediction)
    payload = {
        "image_uri": "images/test.jpg",
        "mark_type": "box",
        "analysis_mode": "distance",
        "target_object_type": "car",
        "box": {"x": 12, "y": 18, "width": 32, "height": 20},
    }

    response = client.post("/v1/predict-distance", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["distance_cm"] == 42.0
    assert body["model_version"] == "test-v1"
    assert body["label_position"] == {"x": 12.0, "y": 8.0}


async def fake_fetch_timeout(payload: dict, request_id: str | None = None) -> dict:
    raise ModelServiceError(504, "Timed out while calling model service.")


def test_predict_timeout_from_model_service(monkeypatch) -> None:
    monkeypatch.setattr(routes, "fetch_model_prediction", fake_fetch_timeout)
    payload = {
        "image_uri": "images/test.jpg",
        "mark_type": "polygon",
        "analysis_mode": "depth",
        "target_object_type": "mountain",
        "polygon": [{"x": 2, "y": 5}],
    }

    response = client.post("/v1/predict-distance", json=payload)
    assert response.status_code == 504
    assert response.json()["detail"] == "Timed out while calling model service."


async def fake_fetch_invalid_payload(payload: dict, request_id: str | None = None) -> dict:
    return {"distance_cm": "oops", "confidence": 0.9, "model_version": "bad-v1"}


def test_predict_invalid_upstream_payload(monkeypatch) -> None:
    monkeypatch.setattr(routes, "fetch_model_prediction", fake_fetch_invalid_payload)
    payload = {
        "image_uri": "images/test.jpg",
        "mark_type": "box",
        "analysis_mode": "size",
        "target_object_type": "logistics box",
        "box": {"x": 12, "y": 18, "width": 32, "height": 20},
    }

    response = client.post("/v1/predict-distance", json=payload)
    assert response.status_code == 502
    assert response.json()["detail"] == "Model service returned an invalid prediction payload."
