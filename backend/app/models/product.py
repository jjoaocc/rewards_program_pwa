import uuid

from sqlalchemy import DECIMAL, TIMESTAMP, Boolean, Column, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    points_cost = Column(DECIMAL(10, 2), nullable=False)
    category = Column(String(50), nullable=False, index=True)  # 'ferramenta', 'material', 'vale-compra', 'brinde'
    stock = Column(Integer, default=0)
    active = Column(Boolean, default=True, index=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
