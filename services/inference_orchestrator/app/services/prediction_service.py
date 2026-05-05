import httpx
import logging
from app.core.config import MODEL_SERVICE_URL
from app.schemas import ModelPrediction, Point, PredictRequest, PredictResponse

logger = logging.getLogger("inference_orchestrator.prediction")


class ModelServiceError(Exception):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


async def fetch_model_prediction(payload: dict, request_id: str | None = None) -> dict:
    headers: dict[str, str] = {}
    if request_id:
        headers["x-request-id"] = request_id

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                f"{MODEL_SERVICE_URL}/v1/model/predict",
                json=payload,
                headers=headers,
            )
            response.raise_for_status()
    except httpx.TimeoutException as exc:
        logger.error("Model service timeout: request_id=%s", request_id)
        raise ModelServiceError(504, "Timed out while calling model service.") from exc
    except httpx.HTTPStatusError as exc:
        logger.error("Model service HTTP error %d: request_id=%s", exc.response.status_code, request_id)
        raise ModelServiceError(
            502,
            f"Model service returned HTTP {exc.response.status_code}.",
        ) from exc
    except httpx.RequestError as exc:
        logger.error("Model service unreachable: request_id=%s error=%s", request_id, exc)
        raise ModelServiceError(502, "Could not reach model service.") from exc

    try:
        return response.json()
    except ValueError as exc:
        raise ModelServiceError(502, "Model service returned non-JSON content.") from exc


def build_prediction_response(
    payload: PredictRequest,
    model_result: ModelPrediction,
) -> PredictResponse:
    """Compute the label anchor at the visual center of the annotated shape."""
    if payload.box:
        # Center of the bounding box
        label_x = payload.box.x + payload.box.width / 2
        label_y = payload.box.y + payload.box.height / 2
    elif payload.polygon and len(payload.polygon) >= 3:
        # Centroid of the polygon vertices
        label_x = sum(p.x for p in payload.polygon) / len(payload.polygon)
        label_y = sum(p.y for p in payload.polygon) / len(payload.polygon)
    else:
        label_x = 100.0
        label_y = 100.0

    logger.info(
        "Prediction result: distance=%.1f cm confidence=%.3f model=%s label=(%.0f, %.0f)",
        model_result.distance_cm,
        model_result.confidence,
        model_result.model_version,
        label_x,
        label_y,
    )

    return PredictResponse(
        distance_cm=round(model_result.distance_cm, 1),
        confidence=round(model_result.confidence, 4),
        model_version=model_result.model_version,
        label_position=Point(x=label_x, y=label_y),
    )

