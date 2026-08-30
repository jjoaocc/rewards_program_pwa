import uuid
from datetime import datetime, timedelta
from decimal import Decimal

from app.application.transaction_use_cases import list_transactions
from app.core.pagination import MAX_PAGE_SIZE
from app.domain.transaction import Transaction
from tests.fakes.fake_transaction_repository import FakeTransactionRepository


def _make_transaction(**overrides) -> Transaction:
    defaults = {
        "id": uuid.uuid4(),
        "customer_id": "C0001",
        "type": "credit",
        "amount": Decimal("10.00"),
        "description": "Compra teste",
        "store": None,
        "created_at": datetime(2026, 1, 1),
        "items": [],
    }
    defaults.update(overrides)
    return Transaction(**defaults)


def test_list_transactions_only_returns_the_given_customers():
    repo = FakeTransactionRepository(
        [_make_transaction(customer_id="C0001"), _make_transaction(customer_id="C0002")]
    )

    result = list_transactions(repo, "C0001")

    assert len(result) == 1
    assert result[0].customer_id == "C0001"


def test_list_transactions_is_capped_even_without_explicit_limit():
    base = datetime(2026, 1, 1)
    transactions = [
        _make_transaction(created_at=base - timedelta(minutes=i), description=f"Compra {i}") for i in range(150)
    ]
    repo = FakeTransactionRepository(transactions)

    result = list_transactions(repo, "C0001")

    assert len(result) <= MAX_PAGE_SIZE


def test_list_transactions_offset_reaches_older_records():
    base = datetime(2026, 1, 1)
    transactions = [
        _make_transaction(created_at=base - timedelta(minutes=i), description=f"Compra {i}") for i in range(150)
    ]
    repo = FakeTransactionRepository(transactions)

    first_page = list_transactions(repo, "C0001", limit=100, offset=0)
    second_page = list_transactions(repo, "C0001", limit=100, offset=100)

    assert len(first_page) == 100
    assert len(second_page) == 50
    first_descriptions = {t.description for t in first_page}
    second_descriptions = {t.description for t in second_page}
    assert first_descriptions.isdisjoint(second_descriptions)
    assert "Compra 149" in second_descriptions
