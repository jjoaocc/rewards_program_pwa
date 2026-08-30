from datetime import datetime
from decimal import Decimal

import pytest

from app.application.customer_use_cases import get_profile, get_stats, update_profile
from app.domain.customer import Address, Customer, EmailAlreadyInUseError
from tests.fakes.fake_customer_repository import FakeCustomerRepository


def _make_customer(**overrides) -> Customer:
    defaults = {
        "id": "C0001",
        "name": "Cliente Teste",
        "email": "cliente@example.com",
        "secondary_email": None,
        "password_hash": "x",
        "document": "12345678900",
        "document_type": "cpf",
        "birth_date": None,
        "phone": None,
        "mobile": None,
        "balance": Decimal("100.00"),
        "is_active": True,
        "created_at": datetime(2026, 1, 1),
        "address": None,
    }
    defaults.update(overrides)
    return Customer(**defaults)


def test_get_profile_includes_primary_address():
    address = Address(
        cep="89200-000", street="Rua X", number="1", complement=None, neighborhood="Centro", city="Joinville",
        state="SC",
    )
    repo = FakeCustomerRepository([_make_customer(address=address)])

    profile = get_profile(repo, "C0001")

    assert profile is not None
    assert profile.address is not None
    assert profile.address.city == "Joinville"


def test_update_profile_changes_allowed_fields_and_keeps_address():
    address = Address(
        cep="89200-000", street="Rua X", number="1", complement=None, neighborhood="Centro", city="Joinville",
        state="SC",
    )
    repo = FakeCustomerRepository([_make_customer(address=address, name="Nome Antigo")])

    profile = update_profile(repo, "C0001", {"name": "Nome Novo"})

    assert profile is not None
    assert profile.name == "Nome Novo"
    assert profile.address is not None


def test_update_profile_raises_when_email_already_used_by_another_customer():
    repo = FakeCustomerRepository(
        [_make_customer(id="C0001", email="a@example.com"), _make_customer(id="C0002", email="b@example.com")]
    )

    with pytest.raises(EmailAlreadyInUseError):
        update_profile(repo, "C0001", {"email": "b@example.com"})


def test_get_stats_sums_credit_and_debit_transactions():
    member_since = datetime(2026, 1, 1)
    repo = FakeCustomerRepository(
        [_make_customer()],
        transactions=[
            ("C0001", "credit", Decimal("50.00")),
            ("C0001", "credit", Decimal("30.00")),
            ("C0001", "debit", Decimal("20.00")),
            ("C9999", "credit", Decimal("999.00")),  # de outro cliente, nao deve contar
        ],
    )

    stats = get_stats(repo, "C0001", member_since)

    assert stats.total_earned == Decimal("80.00")
    assert stats.total_redeemed == Decimal("20.00")
    assert stats.transaction_count == 3
    assert stats.member_since == member_since
