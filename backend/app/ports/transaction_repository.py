from typing import Protocol

from app.domain.transaction import Transaction


class TransactionRepository(Protocol):
    def list_for_customer(self, customer_id: str, *, limit: int, offset: int) -> list[Transaction]: ...
