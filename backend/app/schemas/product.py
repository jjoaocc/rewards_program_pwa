from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, field_serializer


class ProductResponse(BaseModel):
    id: UUID
    name: str
    description: str
    points_cost: Decimal
    category: str  # 'ferramenta', 'material', 'vale-compra', 'brinde'
    stock: int
    active: bool
    image_url: str | None = None
    created_at: datetime

    # Converter UUID para string na serialização
    @field_serializer("id")
    def serialize_id(self, value: UUID) -> str:
        return str(value)

    class Config:
        from_attributes = True


# Schema para filtros de produtos
class ProductFilters(BaseModel):
    category: str | None = None
    min_points: Decimal | None = None
    max_points: Decimal | None = None
    in_stock: bool | None = True
