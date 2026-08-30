from decimal import Decimal

import pytest

from app.adapters.db.customer_repository import SqlAlchemyCustomerRepository
from app.domain.customer import EmailAlreadyInUseError
from app.models import Address, Customer, Transaction


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


def test_get_by_id_does_not_include_address(db_session):
    customer = _make_customer(db_session)
    db_session.add(
        Address(
            customer_id=customer.id, zip_code="89200-000", street="Rua X", number="1", neighborhood="Centro",
            city="Joinville", state="SC", is_primary=True,
        )
    )
    db_session.commit()
    repo = SqlAlchemyCustomerRepository(db_session)

    result = repo.get_by_id(customer.id)

    assert result is not None
    assert result.address is None


def test_get_profile_includes_primary_address(db_session):
    customer = _make_customer(db_session)
    db_session.add(
        Address(
            customer_id=customer.id, zip_code="89200-000", street="Rua X", number="1", neighborhood="Centro",
            city="Joinville", state="SC", is_primary=True,
        )
    )
    db_session.commit()
    repo = SqlAlchemyCustomerRepository(db_session)

    result = repo.get_profile(customer.id)

    assert result is not None
    assert result.address is not None
    assert result.address.city == "Joinville"


def test_get_by_identifier_matches_by_email_or_id(db_session):
    customer = _make_customer(db_session)
    repo = SqlAlchemyCustomerRepository(db_session)

    assert repo.get_by_identifier("cliente@example.com").id == customer.id
    assert repo.get_by_identifier(customer.id).id == customer.id
    assert repo.get_by_identifier("nao-existe@example.com") is None


def test_update_changes_fields(db_session):
    customer = _make_customer(db_session)
    repo = SqlAlchemyCustomerRepository(db_session)

    result = repo.update(customer.id, {"name": "Nome Novo"})

    assert result.name == "Nome Novo"


def test_update_raises_when_email_already_in_use(db_session):
    _make_customer(db_session, id="C0001", email="a@example.com")
    _make_customer(db_session, id="C0002", email="b@example.com", document="99999999999")
    repo = SqlAlchemyCustomerRepository(db_session)

    with pytest.raises(EmailAlreadyInUseError):
        repo.update("C0001", {"email": "b@example.com"})


def test_get_stats_sums_transactions_against_real_postgres(db_session):
    customer = _make_customer(db_session)
    db_session.add_all(
        [
            Transaction(customer_id=customer.id, type="credit", amount=Decimal("50.00"), description="a"),
            Transaction(customer_id=customer.id, type="debit", amount=Decimal("20.00"), description="b"),
        ]
    )
    db_session.commit()
    repo = SqlAlchemyCustomerRepository(db_session)

    stats = repo.get_stats(customer.id, customer.created_at)

    assert stats.total_earned == Decimal("50.00")
    assert stats.total_redeemed == Decimal("20.00")
    assert stats.transaction_count == 2


def test_search_matches_by_name_email_or_id(db_session):
    _make_customer(db_session, id="C0001", email="furadeira@example.com", name="Cliente A")
    _make_customer(db_session, id="C0002", email="b@example.com", name="Cliente B", document="99999999999")
    repo = SqlAlchemyCustomerRepository(db_session)

    result = repo.search("furadeira", limit=20)

    assert [c.id for c in result] == ["C0001"]


def test_search_without_query_returns_all_ordered_by_name(db_session):
    _make_customer(db_session, id="C0002", email="b@example.com", name="Zeca", document="99999999999")
    _make_customer(db_session, id="C0001", email="a@example.com", name="Ana")
    repo = SqlAlchemyCustomerRepository(db_session)

    result = repo.search("", limit=20)

    assert [c.name for c in result] == ["Ana", "Zeca"]


def test_filter_existing_ids_drops_unknown_ids(db_session):
    _make_customer(db_session, id="C0001")
    repo = SqlAlchemyCustomerRepository(db_session)

    result = repo.filter_existing_ids(["C0001", "C9999"])

    assert result == ["C0001"]
