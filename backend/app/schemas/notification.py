from pydantic import BaseModel, field_serializer
from datetime import datetime
from typing import Optional
from uuid import UUID

class NotificationResponse(BaseModel):
    id: UUID  # MUDADO de str para UUID
    title: str
    message: str
    type: str  # 'promotion', 'reward', 'system'
    read: bool
    image_url: Optional[str] = None
    action_url: Optional[str] = None
    created_at: datetime
    
    # Converter UUID para string na serialização
    @field_serializer('id')
    def serialize_id(self, value: UUID) -> str:
        return str(value)
    
    class Config:
        from_attributes = True

# Schema para marcar como lida
class NotificationMarkRead(BaseModel):
    notification_ids: list[str]