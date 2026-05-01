from fastapi import HTTPException
from hmac import compare_digest
import httpx
from .config import AUTH_SERVICE_URL, GATEWAY_API_KEY


def verify_api_key(x_api_key: str | None) -> None:
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing x-api-key header")
    if not compare_digest(x_api_key, GATEWAY_API_KEY):
        raise HTTPException(status_code=401, detail="Invalid API key")


async def verify_token(authorization: str | None) -> None:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.post(
            f"{AUTH_SERVICE_URL}/internal/verify",
            json={"authorization": authorization},
        )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Token verification failed")
