from datetime import datetime
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.domain.customer import Address, Customer, CustomerStats, EmailAlreadyInUseError
from app.models import Address as AddressModel
from app.models import Customer as CustomerModel
from app.models import Transaction as TransactionModel


def _to_domain(row: CustomerModel, address_row: AddressModel | None = None) -> Customer:
    address = None
    if address_row:
        address = Address(
            cep=address_row.zip_code,
            street=address_row.street,
            number=address_row.number,
            complement=address_row.complement,
            neighborhood=address_row.neighborhood,
            city=address_row.city,
            state=address_row.state,
        )

    return Customer(
        id=row.id,
        name=row.name,
        email=row.email,
        secondary_email=row.secondary_email,
        password_hash=row.password_hash,
        document=row.document,
        document_type=row.document_type,
        birth_date=row.birth_date,
        phone=row.phone,
        mobile=row.mobile,
        balance=row.balance,
        is_active=row.is_active,
        created_at=row.created_at,
        address=address,
    )


class SqlAlchemyCustomerRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def get_by_id(self, customer_id: str) -> Customer | None:
        row = self._db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
        return _to_domain(row) if row else None

    def get_by_identifier(self, identifier: str) -> Customer | None:
        row = (
            self._db.query(CustomerModel)
            .filter((CustomerModel.email == identifier) | (CustomerModel.id == identifier))
            .first()
        )
        return _to_domain(row) if row else None

    def get_profile(self, customer_id: str) -> Customer | None:
        row = self._db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
        if not row:
            return None

        address_row = (
            self._db.query(AddressModel)
            .filter(AddressModel.customer_id == customer_id, AddressModel.is_primary.is_(True))
            .first()
        )
        return _to_domain(row, address_row)

    def update(self, customer_id: str, update_data: dict) -> Customer:
        row = self._db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
        if row is None:
            raise ValueError(f"customer {customer_id} not found")
        for field, value in update_data.items():
            setattr(row, field, value)
        try:
            self._db.commit()
        except IntegrityError as e:
            self._db.rollback()
            raise EmailAlreadyInUseError() from e
        self._db.refresh(row)
        return _to_domain(row)

    def get_stats(self, customer_id: str, member_since: datetime) -> CustomerStats:
        total_earned = (
            self._db.query(func.sum(TransactionModel.amount))
            .filter(TransactionModel.customer_id == customer_id, TransactionModel.type == "credit")
            .scalar()
            or Decimal("0")
        )
        total_redeemed = (
            self._db.query(func.sum(TransactionModel.amount))
            .filter(TransactionModel.customer_id == customer_id, TransactionModel.type == "debit")
            .scalar()
            or Decimal("0")
        )
        transaction_count = (
            self._db.query(func.count(TransactionModel.id))
            .filter(TransactionModel.customer_id == customer_id)
            .scalar()
            or 0
        )
        return CustomerStats(
            total_earned=total_earned,
            total_redeemed=total_redeemed,
            transaction_count=transaction_count,
            member_since=member_since,
        )
