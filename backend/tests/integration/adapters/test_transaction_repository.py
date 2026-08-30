from datetime import datetime, timedelta

from app.adapters.db.transaction_repository import SqlAlchemyTransactionRepository
from app.models import Customer, Transaction, TransactionItem


def _make_customer(db_session, **overrides):
    defaults = {
        "id": "C0001",
        "name": "Cliente Teste",
        "email": "cliente@example.com",
        "password_hash": "x",
        "document": "12345678900",
        "document_type": "cpf",
    }
    defaults.update(overrides)
    customer = Customer(**defaults)
    db_session.add(customer)
    db_session.commit()
    return customer


def test_list_for_customer_only_returns_the_given_customer(db_session):
    customer = _make_customer(db_session)
    other = _make_customer(db_session, id="C0002", email="outro@example.com", document="99999999999")
    db_session.add(Transaction(customer_id=customer.id, type="credit", amount="10.00", description="a"))
    db_session.add(Transaction(customer_id=other.id, type="credit", amount="10.00", description="b"))
    db_session.commit()
    repo = SqlAlchemyTransactionRepository(db_session)

    result = repo.list_for_customer(customer.id, limit=100, offset=0)

    assert len(result) == 1
    assert result[0].customer_id == customer.id


def test_list_for_customer_includes_items(db_session):
    customer = _make_customer(db_session)
    transaction = Transaction(customer_id=customer.id, type="credit", amount="10.00", description="a")
    db_session.add(transaction)
    db_session.commit()
    db_session.add(
        TransactionItem(
            transaction_id=transaction.id, name="Item 1", quantity=2, unit_price="5.00", total_price="10.00"
        )
    )
    db_session.commit()
    repo = SqlAlchemyTransactionRepository(db_session)

    result = repo.list_for_customer(customer.id, limit=100, offset=0)

    assert len(result) == 1
    assert len(result[0].items) == 1
    assert result[0].items[0].name == "Item 1"


def test_list_for_customer_respects_limit_and_offset(db_session):
    customer = _make_customer(db_session)
    base = datetime(2026, 1, 1, 12, 0, 0)
    for i in range(5):
        db_session.add(
            Transaction(
                customer_id=customer.id,
                type="credit",
                amount="10.00",
                description=f"Compra {i}",
                created_at=base - timedelta(minutes=i),
            )
        )
    db_session.commit()
    repo = SqlAlchemyTransactionRepository(db_session)

    first_page = repo.list_for_customer(customer.id, limit=2, offset=0)
    second_page = repo.list_for_customer(customer.id, limit=2, offset=2)

    assert [t.description for t in first_page] == ["Compra 0", "Compra 1"]
    assert [t.description for t in second_page] == ["Compra 2", "Compra 3"]
