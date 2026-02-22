from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import List

from app.api.deps import get_db, get_current_customer
from app.models import Customer, Transaction
from app.schemas.transaction import TransactionResponse

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("", response_model=List[TransactionResponse])
def get_my_transactions(
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    transactions = (
        db.query(Transaction)
        .options(joinedload(Transaction.items))
        .filter(Transaction.customer_id == current_customer.id)
        .order_by(desc(Transaction.created_at))
        .all()
    )
    return transactions