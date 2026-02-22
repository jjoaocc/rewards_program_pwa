from pydantic import BaseModel, field_serializer
from decimal import Decimal
from datetime import datetime
from typing import Optional, List
from uuid import UUID

class TransactionItemResponse(BaseModel):
    id: UUID
    name: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal

    @field_serializer('id')
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
    store: Optional[str] = None
    created_at: datetime
    items: List[TransactionItemResponse] = []

    @field_serializer('id')
    def serialize_id(self, value: UUID) -> str:
        return str(value)

    class Config:
        from_attributes = True

class TransactionFilters(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    type: Optional[str] = None