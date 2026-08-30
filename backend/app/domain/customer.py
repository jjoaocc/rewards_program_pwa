from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal


class EmailAlreadyInUseError(Exception):
    """Outro cliente já usa esse email (coluna unique)."""


@dataclass(frozen=True)
class Address:
    cep: str
    street: str
    number: str
    complement: str | None
    neighborhood: str
    city: str
    state: str


@dataclass(frozen=True)
class Customer:
    id: str
    name: str
    email: str
    secondary_email: str | None
    password_hash: str
    document: str
    document_type: str
    birth_date: date | None
    phone: str | None
    mobile: str | None
    balance: Decimal
    is_active: bool
    created_at: datetime
    address: Address | None = None


@dataclass(frozen=True)
class CustomerStats:
    total_earned: Decimal
    total_redeemed: Decimal
    transaction_count: int
    member_since: datetime
