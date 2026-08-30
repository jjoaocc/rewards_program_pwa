from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Address, Customer, Transaction
from app.schemas.customer import AddressResponse


class EmailAlreadyInUseError(Exception):
    """Outro cliente já usa esse email (coluna unique)."""


def build_customer_response(customer: Customer, db: Session) -> dict:
    """Monta o dict de resposta incluindo endereço primário."""
    address = db.query(Address).filter(Address.customer_id == customer.id, Address.is_primary.is_(True)).first()

    address_data = None
    if address:
        address_data = AddressResponse(
            cep=address.zip_code,
            street=address.street,
            number=address.number,
            complement=address.complement,
            neighborhood=address.neighborhood,
            city=address.city,
            state=address.state,
        )

    return {
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "secondary_email": customer.secondary_email,
        "document": customer.document,
        "document_type": customer.document_type,
        "birth_date": customer.birth_date,
        "phone": customer.phone,
        "mobile": customer.mobile,
        "balance": customer.balance,
        "is_active": customer.is_active,
        "created_at": customer.created_at,
        "address": address_data,
    }


def update_customer(db: Session, customer: Customer, update_data: dict) -> Customer:
    for field, value in update_data.items():
        setattr(customer, field, value)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise EmailAlreadyInUseError() from e
    db.refresh(customer)
    return customer


def get_customer_stats(db: Session, customer: Customer) -> dict:
    total_earned = (
        db.query(func.sum(Transaction.amount))
        .filter(Transaction.customer_id == customer.id, Transaction.type == "credit")
        .scalar()
        or 0
    )
    total_redeemed = (
        db.query(func.sum(Transaction.amount))
        .filter(Transaction.customer_id == customer.id, Transaction.type == "debit")
        .scalar()
        or 0
    )
    transaction_count = (
        db.query(func.count(Transaction.id)).filter(Transaction.customer_id == customer.id).scalar() or 0
    )
    return {
        "total_earned": total_earned,
        "total_redeemed": total_redeemed,
        "transaction_count": transaction_count,
        "member_since": customer.created_at,
    }
