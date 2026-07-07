import uuid

from sqlalchemy import DECIMAL, TIMESTAMP, Boolean, Column, Date, String, Text, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    discount = Column(DECIMAL(5, 2), nullable=False)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False, index=True)
    image_url = Column(String(500), nullable=True)
    active = Column(Boolean, default=True, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
