# backend/app/schemas/customer.py

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


class CustomerLogin(BaseModel):
    identifier: str
    # bcrypt só considera os primeiros 72 bytes; acima disso ele levanta ValueError
    # em vez de comparar. Rejeitar aqui dá um 422 claro em vez de deixar o erro
    # estourar lá na frente como 500.
    password: str = Field(..., max_length=72)


class AddressResponse(BaseModel):
    cep: str
    street: str
    number: str
    complement: str | None = None
    neighborhood: str
    city: str
    state: str

    class Config:
        from_attributes = True


class CustomerResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    secondary_email: EmailStr | None = None
    document: str
    document_type: str
    birth_date: date | None = None
    phone: str | None = None
    mobile: str | None = None
    balance: Decimal
    is_active: bool
    created_at: datetime
    address: AddressResponse | None = None

    class Config:
        from_attributes = True


class CustomerUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    secondary_email: EmailStr | None = None
    phone: str | None = None
    mobile: str | None = None
    birth_date: date | None = None


class CustomerStats(BaseModel):
    total_earned: Decimal
    total_redeemed: Decimal
    transaction_count: int
    member_since: datetime
