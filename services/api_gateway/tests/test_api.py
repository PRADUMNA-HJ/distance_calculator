from fastapi.testclient import TestClient
from app.main import app
from app.api import routes
import json

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "api_gateway"


def test_requires_auth_for_annotations() -> None:
    response = client.post("/api/v1/annotations", json={"image_id": "x"})
    assert response.status_code == 401


def test_invalid_api_key_for_annotations() -> None:
    response = client.post(
        "/api/v1/annotations",
        json={"image_id": "x"},
        headers={"x-api-key": "wrong-key"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid API key"


def test_login_proxy(monkeypatch) -> None:
    class FakeResponse:
        def __init__(self, status_code: int, payload: dict) -> None:
            self.status_code = status_code
            self._payload = payload
            self.text = json.dumps(payload)

        def json(self):
            return self._payload

    class FakeAsyncClient:
        def __init__(self, *args, **kwargs) -> None:
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def post(self, url: str, json=None, headers=None):
            assert url.endswith("/v1/login")
            assert json == {"username": "demo-user", "password": "demo-pass"}
            return FakeResponse(
                200,
                {
                    "access_token": "demo-token",
                    "token_type": "bearer",
                    "expires_in": 3600,
                },
            )

    monkeypatch.setattr(routes.httpx, "AsyncClient", FakeAsyncClient)

    response = client.post("/api/v1/login", json={"username": "demo-user", "password": "demo-pass"})
    assert response.status_code == 200
    assert response.json()["access_token"] == "demo-token"


def test_system_health_degraded_when_one_service_fails(monkeypatch) -> None:
    class FakeResponse:
        def __init__(self, status_code: int) -> None:
            self.status_code = status_code

    class FakeAsyncClient:
        def __init__(self, *args, **kwargs) -> None:
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, url: str):
            if "annotation" in url:
                return FakeResponse(200)
            if "inference" in url or "8003" in url:
                return FakeResponse(503)
            if "model" in url or "8004" in url:
                return FakeResponse(200)
            return FakeResponse(200)

    monkeypatch.setattr(routes.httpx, "AsyncClient", FakeAsyncClient)

    response = client.get("/api/v1/system/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "degraded"
    assert payload["services"]["annotation_service"]["status"] == "ok"
    assert payload["services"]["inference_orchestrator"]["status"] == "down"
    assert payload["services"]["model_service"]["status"] == "ok"


def test_models_active_proxy(monkeypatch) -> None:
    class FakeResponse:
        def __init__(self, status_code: int, payload: dict) -> None:
            self.status_code = status_code
            self._payload = payload
            self.text = json.dumps(payload)

        def json(self):
            return self._payload

    class FakeAsyncClient:
        def __init__(self, *args, **kwargs) -> None:
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def post(self, url: str, json=None, headers=None):
            if url.endswith("/internal/verify"):
                return FakeResponse(200, {"valid": True})
            return FakeResponse(404, {"detail": "not found"})

        async def get(self, url: str, headers=None):
            assert url.endswith("/v1/model/active")
            return FakeResponse(
                200,
                {
                    "model_name": "distance-regressor",
                    "model_version": "baseline-v0",
                    "trained_on": "2024-01-01T00:00:00Z",
                },
            )

    monkeypatch.setattr(routes.httpx, "AsyncClient", FakeAsyncClient)

    response = client.get(
        "/api/v1/models/active",
        headers={"x-api-key": "dev-gateway-key", "Authorization": "Bearer demo"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["model_version"] == "baseline-v0"


def test_predict_distance_upload(monkeypatch, tmp_path) -> None:
    class FakeResponse:
        def __init__(self, status_code: int, payload: dict) -> None:
            self.status_code = status_code
            self._payload = payload

        def json(self):
            return self._payload

    class FakeAsyncClient:
        def __init__(self, *args, **kwargs) -> None:
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def post(self, url: str, json=None, headers=None):
            if url.endswith("/internal/verify"):
                return FakeResponse(200, {"valid": True})

            assert url.endswith("/v1/predict-distance")
            assert json["image_uri"].startswith(str(tmp_path).replace("\\", "/"))
            return FakeResponse(
                200,
                {
                    "distance_cm": 12.5,
                    "confidence": 0.88,
                    "model_version": "test-v1",
                    "label_position": {"x": 10, "y": 12},
                },
            )

    monkeypatch.setattr(routes, "UPLOAD_DIR", tmp_path / "uploads")
    monkeypatch.setattr(routes.httpx, "AsyncClient", FakeAsyncClient)

    response = client.post(
        "/api/v1/predict-distance/upload",
        data={
            "annotation_json": json.dumps(
                {
                    "image_id": "img-1",
                    "image_uri": "uploads/source.jpg",
                    "mark_type": "box",
                    "box": {"x": 12, "y": 18, "width": 32, "height": 20},
                }
            )
        },
        files={"image_file": ("source.jpg", b"fake-image-bytes", "image/jpeg")},
        headers={"x-api-key": "dev-gateway-key", "Authorization": "Bearer test-token"},
    )

    assert response.status_code == 200
    assert response.json()["distance_cm"] == 12.5
