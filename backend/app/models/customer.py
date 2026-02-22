from sqlalchemy import Column, String, Date, DECIMAL, Boolean, TIMESTAMP, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(String(20), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    document = Column(String(18), unique=True, nullable=False, index=True)
    document_type = Column(String(4), nullable=False)  # 'cpf' ou 'cnpj'
    birth_date = Column(Date, nullable=True)
    phone = Column(String(20), nullable=True)
    mobile = Column(String(20), nullable=True)
    balance = Column(DECIMAL(10, 2), default=0.00)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    addresses = relationship("Address", back_populates="customer", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="customer", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="customer", cascade="all, delete-orphan")
    redemptions = relationship("Redemption", back_populates="customer", cascade="all, delete-orphan")
    push_subscriptions = relationship("PushSubscription", back_populates="customer", cascade="all, delete-orphan")  # ← NOVO