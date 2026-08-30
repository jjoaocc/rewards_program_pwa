import uuid
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal


@dataclass(frozen=True)
class Product:
    id: uuid.UUID
    name: str
    description: str
    points_cost: Decimal
    category: str
    stock: int
    active: bool
    image_url: str | None
    created_at: datetime


@dataclass(frozen=True)
class ProductFilters:
    category: str | None = None
    min_points: Decimal | None = None
    max_points: Decimal | None = None
    in_stock: bool = True
    active_only: bool = True
