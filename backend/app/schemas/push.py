from pydantic import BaseModel
from typing import Optional


class PushSubscribeRequest(BaseModel):
    endpoint: str
    p256dh: str
    auth: str
    user_agent: Optional[str] = None


class PushSendRequest(BaseModel):
    customer_id: str
    title: str
    message: str
    url: str = "/"


class PushBroadcastRequest(BaseModel):
    title: str
    message: str
    url: str = "/"


class PushPublicKeyResponse(BaseModel):
    public_key: str