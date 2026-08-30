from app.core.pagination import MAX_PAGE_SIZE
from app.domain.transaction import Transaction
from app.ports.transaction_repository import TransactionRepository


def list_transactions(
    repo: TransactionRepository, customer_id: str, *, limit: int = MAX_PAGE_SIZE, offset: int = 0
) -> list[Transaction]:
    return repo.list_for_customer(customer_id, limit=limit, offset=offset)
