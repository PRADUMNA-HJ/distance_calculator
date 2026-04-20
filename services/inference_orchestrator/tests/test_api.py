from fastapi.testclient import TestClient
from app.main import app
from app.api import routes

client = TestClient(app)


async def fake_fetch_model_prediction(payload: dict) -> dict:
    return {"distance_cm": 42.0, "confidence": 0.9, "model_version": "test-v1"}


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200


def test_predict_with_mocked_model(monkeypatch) -> None:
    monkeypatch.setattr(routes, "fetch_model_prediction", fake_fetch_model_prediction)
    payload = {"image_uri": "images/test.jpg", "mark_type": "box", "box": {"x": 12, "y": 18}}

    response = client.post("/v1/predict-distance", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["distance_cm"] == 42.0
    assert body["model_version"] == "test-v1"
