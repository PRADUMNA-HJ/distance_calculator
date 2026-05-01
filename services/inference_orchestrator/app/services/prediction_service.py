import httpx
from app.core.config import MODEL_SERVICE_URL
from app.schemas import ModelPrediction, Point, PredictRequest, PredictResponse


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
        raise ModelServiceError(504, "Timed out while calling model service.") from exc
    except httpx.HTTPStatusError as exc:
        raise ModelServiceError(
            502,
            f"Model service returned HTTP {exc.response.status_code}.",
        ) from exc
    except httpx.RequestError as exc:
        raise ModelServiceError(502, "Could not reach model service.") from exc

    try:
        return response.json()
    except ValueError as exc:
        raise ModelServiceError(502, "Model service returned non-JSON content.") from exc


def build_prediction_response(
    payload: PredictRequest,
    model_result: ModelPrediction,
) -> PredictResponse:
    label_x = payload.box.x if payload.box else 16
    label_y = max(8, (payload.box.y if payload.box else 16) - 10)

    return PredictResponse(
        distance_cm=model_result.distance_cm,
        confidence=model_result.confidence,
        model_version=model_result.model_version,
        label_position=Point(x=label_x, y=label_y),
    )
