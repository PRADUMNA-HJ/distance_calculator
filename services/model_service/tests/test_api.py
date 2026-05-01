from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200


def test_active_model() -> None:
    response = client.get("/v1/model/active")
    assert response.status_code == 200
    assert "model_version" in response.json()
    assert "trained_on" in response.json()


def test_predict() -> None:
    response = client.post("/v1/model/predict", json={"image_uri": "x"})
    assert response.status_code == 200
    assert "distance_cm" in response.json()
