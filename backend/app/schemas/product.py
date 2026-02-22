from pydantic import BaseModel, field_serializer
from decimal import Decimal
from typing import Optional
from datetime import datetime
from uuid import UUID

class ProductResponse(BaseModel):
    id: UUID  # MUDADO de str para UUID
    name: str
    description: str
    points_cost: Decimal
    category: str  # 'ferramenta', 'material', 'vale-compra', 'brinde'
    stock: int
    active: bool
    image_url: Optional[str] = None
    created_at: datetime
    
    # Converter UUID para string na serialização
    @field_serializer('id')
    def serialize_id(self, value: UUID) -> str:
        return str(value)
    
    class Config:
        from_attributes = True

# Schema para filtros de produtos
class ProductFilters(BaseModel):
    category: Optional[str] = None
    min_points: Optional[Decimal] = None
    max_points: Optional[Decimal] = None
    in_stock: Optional[bool] = True