import uuid

from sqlalchemy import TIMESTAMP, Boolean, Column, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(String(20), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(20), nullable=False)  # 'promotion', 'reward', 'system'
    read = Column(Boolean, default=False, index=True)
    image_url = Column(String(500), nullable=True)
    action_url = Column(String(500), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), index=True)

    # Relationships
    customer = relationship("Customer", back_populates="notifications")
