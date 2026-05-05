from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"service": "model_service", "status": "ok"}

def test_active_model():
    response = client.get("/v1/model/active")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "model_version" in data
    assert "status" in data

def test_predict_distance_box():
    payload = {
        "image_uri": "test.jpg",
        "mark_type": "box",
        "box": {
            "x": 100,
            "y": 100,
            "width": 50,
            "height": 50
        }
    }
    response = client.post("/v1/model/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "distance_cm" in data
    assert "confidence" in data
    assert "label_position" in data
    assert data["label_position"]["x"] == 125.0
    assert data["label_position"]["y"] == 125.0