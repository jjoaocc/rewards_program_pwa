from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, field_serializer


class NotificationResponse(BaseModel):
    id: UUID
    title: str
    message: str
    type: str  # 'promotion', 'reward', 'system'
    read: bool
    image_url: str | None = None
    action_url: str | None = None
    created_at: datetime

    # Converter UUID para string na serialização
    @field_serializer("id")
    def serialize_id(self, value: UUID) -> str:
        return str(value)

    class Config:
        from_attributes = True


# Schema para marcar como lida
class NotificationMarkRead(BaseModel):
    notification_ids: list[str]
