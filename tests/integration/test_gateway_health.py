import os
import requests

BASE_URL = os.getenv("INTEGRATION_BASE_URL", "http://localhost:8000")


def test_gateway_health() -> None:
    response = requests.get(f"{BASE_URL}/health", timeout=10)
    assert response.status_code == 200
    assert response.json().get("service") == "api_gateway"
