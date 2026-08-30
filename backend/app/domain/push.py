import uuid
from dataclasses import dataclass
from datetime import datetime


class SubscriptionConflictError(Exception):
    """Mesma subscription registrada em paralelo por outra requisição concorrente."""


@dataclass(frozen=True)
class PushSubscription:
    id: uuid.UUID
    customer_id: str
    endpoint: str
    p256dh: str
    auth: str
    user_agent: str | None
    created_at: datetime


@dataclass(frozen=True)
class PushCampaign:
    id: uuid.UUID
    title: str
    message: str
    url: str | None
    target_type: str
    target_customer_ids: str | None
    customers_targeted: int
    sent: int
    failed: int
    removed: int
    created_at: datetime
