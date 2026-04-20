import httpx
from app.core.config import MODEL_SERVICE_URL


async def fetch_model_prediction(payload: dict) -> dict:
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(f"{MODEL_SERVICE_URL}/v1/model/predict", json=payload)
    return response.json()


def build_prediction_response(payload: dict, model_result: dict) -> dict:
    box = payload.get("box") or {}
    label_x = box.get("x", 16)
    label_y = max(8, box.get("y", 16) - 10)

    return {
        "distance_cm": model_result.get("distance_cm", 0.0),
        "confidence": model_result.get("confidence", 0.0),
        "model_version": model_result.get("model_version", "unknown"),
        "label_position": {"x": label_x, "y": label_y},
    }
