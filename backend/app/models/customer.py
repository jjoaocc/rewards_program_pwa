from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DECIMAL, TIMESTAMP, Boolean, Date, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.address import Address
    from app.models.notification import Notification
    from app.models.push_subscription import PushSubscription
    from app.models.transaction import Transaction


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String(20), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    secondary_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    document: Mapped[str] = mapped_column(String(18), unique=True, nullable=False, index=True)
    document_type: Mapped[str] = mapped_column(String(4), nullable=False)  # 'cpf' ou 'cnpj'
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    mobile: Mapped[str | None] = mapped_column(String(20), nullable=True)
    balance: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), default=0.00)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    addresses: Mapped[list["Address"]] = relationship(
        "Address", back_populates="customer", cascade="all, delete-orphan"
    )
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="customer", cascade="all, delete-orphan"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification", back_populates="customer", cascade="all, delete-orphan"
    )
    push_subscriptions: Mapped[list["PushSubscription"]] = relationship(
        "PushSubscription", back_populates="customer", cascade="all, delete-orphan"
    )
