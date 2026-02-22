from pydantic import BaseModel, field_serializer
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

class TransactionResponse(BaseModel):
    id: UUID  # MUDADO de str para UUID
    customer_id: str
    type: str  # 'credit' ou 'debit'
    amount: Decimal
    description: str
    store: Optional[str] = None
    created_at: datetime
    
    # Converter UUID para string na serialização
    @field_serializer('id')
    def serialize_id(self, value: UUID) -> str:
        return str(value)
    
    class Config:
        from_attributes = True

# Schema para filtros
class TransactionFilters(BaseModel):
    type: Optional[str] = None  # 'credit', 'debit', ou None para todos
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    store: Optional[str] = None
    min_value: Optional[Decimal] = None
    max_value: Optional[Decimal] = None