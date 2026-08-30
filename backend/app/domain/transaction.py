import uuid
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal


@dataclass(frozen=True)
class TransactionItem:
    id: uuid.UUID
    name: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal


@dataclass(frozen=True)
class Transaction:
    id: uuid.UUID
    customer_id: str
    type: str
    amount: Decimal
    description: str
    store: str | None
    created_at: datetime
    items: list[TransactionItem] = field(default_factory=list)
