from fastapi import HTTPException
import httpx
from .config import AUTH_SERVICE_URL


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
