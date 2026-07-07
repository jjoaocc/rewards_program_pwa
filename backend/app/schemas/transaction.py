from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, field_serializer


class TransactionItemResponse(BaseModel):
    id: UUID
    name: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal

    @field_serializer("id")
    def serialize_id(self, value: UUID) -> str:
        return str(value)

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: UUID
    customer_id: str
    type: str
    amount: Decimal
    description: str
    store: str | None = None
    created_at: datetime
    items: list[TransactionItemResponse] = []

    @field_serializer("id")
    def serialize_id(self, value: UUID) -> str:
        return str(value)

    class Config:
        from_attributes = True


class TransactionFilters(BaseModel):
    start_date: datetime | None = None
    end_date: datetime | None = None
    type: str | None = None
