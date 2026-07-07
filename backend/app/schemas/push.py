from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, field_serializer


class PushSubscribeRequest(BaseModel):
    endpoint: str
    p256dh: str
    auth: str
    user_agent: str | None = None


class PushSendRequest(BaseModel):
    customer_id: str
    title: str
    message: str
    url: str = "/"


class PushBulkSendRequest(BaseModel):
    customer_ids: list[str]
    title: str
    message: str
    url: str = "/"


class PushBroadcastRequest(BaseModel):
    title: str
    message: str
    url: str = "/"


class PushPublicKeyResponse(BaseModel):
    public_key: str


class AdminLoginRequest(BaseModel):
    secret: str


class AdminLoginResponse(BaseModel):
    token: str


class CustomerSearchResult(BaseModel):
    id: str
    name: str
    email: str

    class Config:
        from_attributes = True


class PushCampaignResponse(BaseModel):
    id: UUID
    title: str
    message: str
    url: str | None = None
    target_type: str
    customers_targeted: int
    sent: int
    failed: int
    removed: int
    created_at: datetime

    @field_serializer("id")
    def serialize_id(self, value: UUID) -> str:
        return str(value)

    class Config:
        from_attributes = True
