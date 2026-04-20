from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "api_gateway"


def test_requires_auth_for_annotations() -> None:
    response = client.post("/api/v1/annotations", json={"image_id": "x"})
    assert response.status_code == 401
