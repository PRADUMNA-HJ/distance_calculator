from fastapi import APIRouter, HTTPException
import os
from app.schemas import LoginPayload, VerifyPayload

router = APIRouter()
EXPECTED_BEARER_TOKEN = os.getenv("AUTH_BEARER_TOKEN")
ISSUED_BEARER_TOKEN = os.getenv("AUTH_BEARER_TOKEN", "demo-token")
DEMO_USERNAME = os.getenv("AUTH_DEMO_USERNAME", "demo-user")
DEMO_PASSWORD = os.getenv("AUTH_DEMO_PASSWORD", "demo-pass")


@router.get("/health")
def health() -> dict:
    return {"service": "auth_service", "status": "ok"}


@router.post("/v1/login")
def login(payload: LoginPayload) -> dict:
    if payload.username != DEMO_USERNAME or payload.password != DEMO_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "access_token": ISSUED_BEARER_TOKEN,
        "token_type": "bearer",
        "expires_in": 3600,
    }


@router.post("/internal/verify")
def verify(payload: VerifyPayload) -> dict:
    if not payload.authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    if EXPECTED_BEARER_TOKEN:
        token = payload.authorization.removeprefix("Bearer ").strip()
        if token != EXPECTED_BEARER_TOKEN:
            raise HTTPException(status_code=401, detail="Invalid bearer token")
    return {"valid": True, "user_id": "demo-user", "roles": ["user"]}
