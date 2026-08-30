from app.core.security import verify_password
from app.domain.customer import Customer
from app.ports.customer_repository import CustomerRepository


class InvalidCredentialsError(Exception):
    """Identificador não encontrado ou senha incorreta."""


class InactiveAccountError(Exception):
    """Cliente existe e a senha bate, mas a conta está inativa."""


def authenticate_customer(repo: CustomerRepository, identifier: str, password: str) -> Customer:
    customer = repo.get_by_identifier(identifier)

    if not customer or not verify_password(password, customer.password_hash):
        raise InvalidCredentialsError()

    if not customer.is_active:
        raise InactiveAccountError()

    return customer
