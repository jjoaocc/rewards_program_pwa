from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_customer, get_db
from app.core.pagination import MAX_PAGE_SIZE
from app.models import Customer
from app.schemas.transaction import TransactionResponse
from app.services import transaction_service

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionResponse])
def get_my_transactions(
    limit: int = Query(MAX_PAGE_SIZE, ge=1),
    offset: int = Query(0, ge=0),
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    return transaction_service.list_transactions(db, current_customer.id, limit=limit, offset=offset)
