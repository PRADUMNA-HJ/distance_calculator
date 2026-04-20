import uuid
from fastapi import Request


def get_or_create_request_id(request: Request) -> str:
    return request.headers.get("x-request-id") or str(uuid.uuid4())
