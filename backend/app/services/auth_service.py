from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models import Customer


class InvalidCredentialsError(Exception):
    """Identificador não encontrado ou senha incorreta."""


class InactiveAccountError(Exception):
    """Cliente existe e a senha bate, mas a conta está inativa."""


def authenticate_customer(db: Session, identifier: str, password: str) -> Customer:
    customer = db.query(Customer).filter((Customer.email == identifier) | (Customer.id == identifier)).first()

    if not customer or not verify_password(password, customer.password_hash):
        raise InvalidCredentialsError()

    if not customer.is_active:
        raise InactiveAccountError()

    return customer
