from sqlalchemy import Column, String, DECIMAL, Integer, TIMESTAMP, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class Redemption(Base):
    __tablename__ = "redemptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(String(20), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    points_used = Column(DECIMAL(10, 2), nullable=False)
    quantity = Column(Integer, default=1)
    status = Column(String(20), default='completed')  # 'pending', 'completed', 'cancelled'
    redeemed_at = Column(TIMESTAMP, server_default=func.now(), index=True)
    
    # Relationships
    customer = relationship("Customer", back_populates="redemptions")
    product = relationship("Product", back_populates="redemptions")