import os
import pytest
import requests

BASE_URL = os.getenv("INTEGRATION_BASE_URL", "http://localhost:8000")
API_KEY = os.getenv("INTEGRATION_API_KEY", "dev-gateway-key")
AUTH_TOKEN = os.getenv("INTEGRATION_AUTH_TOKEN", "demo-token")


def _url(path: str) -> str:
    return f"{BASE_URL.rstrip('/')}{path}"


def _predict_payload() -> dict:
    return {
        "image_uri": "images/integration-sample.jpg",
        "mark_type": "box",
        "box": {"x": 12, "y": 18, "width": 32, "height": 20},
    }


@pytest.fixture(scope="module", autouse=True)
def require_gateway_stack() -> None:
    try:
        requests.get(_url("/health"), timeout=3)
    except requests.RequestException as exc:
        pytest.skip(f"Integration stack unavailable at {BASE_URL}: {exc}")


def test_gateway_health() -> None:
    response = requests.get(_url("/health"), timeout=10)
    assert response.status_code == 200
    assert response.json().get("service") == "api_gateway"


def test_gateway_system_health_contract() -> None:
    response = requests.get(_url("/api/v1/system/health"), timeout=10)
    assert response.status_code == 200

    payload = response.json()
    assert payload.get("service") == "api_gateway"
    assert payload.get("status") in {"ok", "degraded"}

    services = payload.get("services")
    assert isinstance(services, dict)
    assert "annotation_service" in services
    assert "inference_orchestrator" in services
    assert "dataset_service" in services


def test_predict_distance_requires_security_headers() -> None:
    response = requests.post(
        _url("/api/v1/predict-distance"),
        json=_predict_payload(),
        timeout=15,
    )
    assert response.status_code == 401


def test_predict_distance_authenticated_gateway_flow() -> None:
    response = requests.post(
        _url("/api/v1/predict-distance"),
        json=_predict_payload(),
        headers={
            "x-api-key": API_KEY,
            "Authorization": f"Bearer {AUTH_TOKEN}",
        },
        timeout=20,
    )

    # 200 means end-to-end prediction succeeded; 502/504 means auth/gateway passed
    # and the request reached upstream inference/model dependencies.
    assert response.status_code in {200, 502, 504}
