from pydantic import BaseModel


class VerifyPayload(BaseModel):
    authorization: str
