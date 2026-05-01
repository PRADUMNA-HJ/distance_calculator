from pydantic import BaseModel


class VerifyPayload(BaseModel):
    authorization: str


class LoginPayload(BaseModel):
    username: str
    password: str
