import uuid
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal


@dataclass(frozen=True)
class Event:
    id: uuid.UUID
    title: str
    description: str
    discount: Decimal
    start_date: date
    end_date: date
    image_url: str | None
    active: bool
    created_at: datetime


@dataclass(frozen=True)
class EventFilters:
    active_only: bool = True
    current_only: bool = False
