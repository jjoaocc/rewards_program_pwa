from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_customer, get_transaction_repository
from app.application import transaction_use_cases
from app.core.pagination import MAX_PAGE_SIZE
from app.domain.customer import Customer
from app.ports.transaction_repository import TransactionRepository
from app.schemas.transaction import TransactionResponse

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionResponse])
def get_my_transactions(
    limit: int = Query(MAX_PAGE_SIZE, ge=1),
    offset: int = Query(0, ge=0),
    current_customer: Customer = Depends(get_current_customer),
    repo: TransactionRepository = Depends(get_transaction_repository),
):
    return transaction_use_cases.list_transactions(repo, current_customer.id, limit=limit, offset=offset)
