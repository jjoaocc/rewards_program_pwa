# backend/app/schemas/customer.py

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class CustomerLogin(BaseModel):
    identifier: str
    password: str


class AddressResponse(BaseModel):
    cep: str
    street: str
    number: str
    complement: Optional[str] = None
    neighborhood: str
    city: str
    state: str

    class Config:
        from_attributes = True


class CustomerResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    document: str
    document_type: str
    birth_date: Optional[date] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    balance: Decimal
    is_active: bool
    created_at: datetime
    address: Optional[AddressResponse] = None  # NOVO

    class Config:
        from_attributes = True


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    birth_date: Optional[date] = None


class CustomerStats(BaseModel):
    total_earned: Decimal
    total_redeemed: Decimal
    transaction_count: int
    member_since: datetime