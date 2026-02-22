from pydantic import BaseModel, field_serializer
from decimal import Decimal
from datetime import date, datetime
from typing import Optional
from uuid import UUID

class EventResponse(BaseModel):
    id: UUID  # MUDADO de str para UUID
    title: str
    description: str
    discount: Decimal
    start_date: date
    end_date: date
    image_url: Optional[str] = None
    active: bool
    created_at: datetime
    
    # Converter UUID para string na serialização
    @field_serializer('id')
    def serialize_id(self, value: UUID) -> str:
        return str(value)
    
    class Config:
        from_attributes = True

# Schema para filtros de eventos
class EventFilters(BaseModel):
    active_only: bool = True
    current_only: bool = False  # Apenas eventos vigentes hoje