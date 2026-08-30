import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DECIMAL, TIMESTAMP, Boolean, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    points_cost: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False)
    category: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # 'ferramenta', 'material', 'vale-compra', 'brinde'
    stock: Mapped[int] = mapped_column(Integer, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())
