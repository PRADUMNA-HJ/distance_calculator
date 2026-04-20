from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "auth_service"


def test_verify_token_success() -> None:
    response = client.post("/internal/verify", json={"authorization": "Bearer test-token"})
    assert response.status_code == 200
    assert response.json()["valid"] is True


def test_verify_token_invalid_format() -> None:
    response = client.post("/internal/verify", json={"authorization": "invalid-token"})
    assert response.status_code == 401
