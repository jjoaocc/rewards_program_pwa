import uuid
from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Notification:
    id: uuid.UUID
    customer_id: str
    title: str
    message: str
    type: str
    read: bool
    image_url: str | None
    action_url: str | None
    created_at: datetime
