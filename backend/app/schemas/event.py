from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, field_serializer


class EventResponse(BaseModel):
    id: UUID
    title: str
    description: str
    discount: Decimal
    start_date: date
    end_date: date
    image_url: str | None = None
    active: bool
    created_at: datetime

    # Converter UUID para string na serialização
    @field_serializer("id")
    def serialize_id(self, value: UUID) -> str:
        return str(value)

    class Config:
        from_attributes = True


# Schema para filtros de eventos
class EventFilters(BaseModel):
    active_only: bool = True
    current_only: bool = False  # Apenas eventos vigentes hoje
