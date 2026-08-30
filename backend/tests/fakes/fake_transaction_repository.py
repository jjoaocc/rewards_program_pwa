from app.core.pagination import clamp_limit
from app.domain.transaction import Transaction


class FakeTransactionRepository:
    def __init__(self, transactions: list[Transaction] | None = None) -> None:
        self._transactions = list(transactions or [])

    def list_for_customer(self, customer_id: str, *, limit: int, offset: int) -> list[Transaction]:
        results = [t for t in self._transactions if t.customer_id == customer_id]
        results = sorted(results, key=lambda t: t.created_at, reverse=True)
        capped_limit = clamp_limit(limit)
        return results[offset : offset + capped_limit]
