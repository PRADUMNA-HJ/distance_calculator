from fastapi import APIRouter, HTTPException
from app.schemas import VerifyPayload

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"service": "auth_service", "status": "ok"}


@router.post("/internal/verify")
def verify(payload: VerifyPayload) -> dict:
    if not payload.authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    return {"valid": True, "user_id": "demo-user", "roles": ["user"]}
