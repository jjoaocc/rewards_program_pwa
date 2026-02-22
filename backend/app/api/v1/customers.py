# backend/app/api/v1/customers.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_customer
from app.models import Customer, Transaction, Address
from app.schemas import CustomerResponse, CustomerUpdate, CustomerStats
from app.schemas.customer import AddressResponse

router = APIRouter(prefix="/customers", tags=["customers"])


def _build_customer_response(customer: Customer, db: Session) -> dict:
    """Monta o dict de resposta incluindo endereço primário."""
    address = (
        db.query(Address)
        .filter(Address.customer_id == customer.id, Address.is_primary == True)
        .first()
    )

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


@router.get("/me", response_model=CustomerResponse)
def get_my_profile(
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    return _build_customer_response(current_customer, db)


@router.patch("/me", response_model=CustomerResponse)
def update_my_profile(
    customer_update: CustomerUpdate,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    update_data = customer_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_customer, field, value)
    db.commit()
    db.refresh(current_customer)
    return _build_customer_response(current_customer, db)


@router.get("/me/stats", response_model=CustomerStats)
def get_my_stats(
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    total_earned = (
        db.query(func.sum(Transaction.amount))
        .filter(Transaction.customer_id == current_customer.id, Transaction.type == "credit")
        .scalar() or 0
    )
    total_redeemed = (
        db.query(func.sum(Transaction.amount))
        .filter(Transaction.customer_id == current_customer.id, Transaction.type == "debit")
        .scalar() or 0
    )
    transaction_count = (
        db.query(func.count(Transaction.id))
        .filter(Transaction.customer_id == current_customer.id)
        .scalar() or 0
    )
    return {
        "total_earned": total_earned,
        "total_redeemed": total_redeemed,
        "transaction_count": transaction_count,
        "member_since": current_customer.created_at,
    }