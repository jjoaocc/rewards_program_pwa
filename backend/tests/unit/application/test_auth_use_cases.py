from datetime import datetime
from decimal import Decimal

import pytest

from app.application.auth_use_cases import InactiveAccountError, InvalidCredentialsError, authenticate_customer
from app.core.security import get_password_hash
from app.domain.customer import Customer
from tests.fakes.fake_customer_repository import FakeCustomerRepository


def _make_customer(**overrides) -> Customer:
    defaults = {
        "id": "C0001",
        "name": "Cliente Teste",
        "email": "cliente@example.com",
        "secondary_email": None,
        "password_hash": get_password_hash("senha-correta"),
        "document": "12345678900",
        "document_type": "cpf",
        "birth_date": None,
        "phone": None,
        "mobile": None,
        "balance": Decimal("0"),
        "is_active": True,
        "created_at": datetime(2026, 1, 1),
        "address": None,
    }
    defaults.update(overrides)
    return Customer(**defaults)


def test_authenticate_customer_succeeds_with_email_and_correct_password():
    repo = FakeCustomerRepository([_make_customer()])

    customer = authenticate_customer(repo, "cliente@example.com", "senha-correta")

    assert customer.id == "C0001"


def test_authenticate_customer_succeeds_with_id_as_identifier():
    repo = FakeCustomerRepository([_make_customer()])

    customer = authenticate_customer(repo, "C0001", "senha-correta")

    assert customer.id == "C0001"


def test_authenticate_customer_rejects_wrong_password():
    repo = FakeCustomerRepository([_make_customer()])

    with pytest.raises(InvalidCredentialsError):
        authenticate_customer(repo, "cliente@example.com", "senha-errada")


def test_authenticate_customer_rejects_unknown_identifier():
    repo = FakeCustomerRepository([])

    with pytest.raises(InvalidCredentialsError):
        authenticate_customer(repo, "nao-existe@example.com", "qualquer")


def test_authenticate_customer_rejects_inactive_account():
    repo = FakeCustomerRepository([_make_customer(is_active=False)])

    with pytest.raises(InactiveAccountError):
        authenticate_customer(repo, "cliente@example.com", "senha-correta")
