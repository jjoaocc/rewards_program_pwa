from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

# Schema para Login
class CustomerLogin(BaseModel):
    identifier: str  # Email ou código
    password: str

# Schema de resposta do cliente (sem senha)
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
    
    class Config:
        from_attributes = True

# Schema para atualizar dados do cliente
class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    birth_date: Optional[date] = None

# Schema de estatísticas do cliente
class CustomerStats(BaseModel):
    total_earned: Decimal
    total_redeemed: Decimal
    transaction_count: int
    member_since: datetime