from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload

from app.core.pagination import clamp_limit
from app.domain.transaction import Transaction, TransactionItem
from app.models import Transaction as TransactionModel
from app.models import TransactionItem as TransactionItemModel


def _item_to_domain(row: TransactionItemModel) -> TransactionItem:
    return TransactionItem(
        id=row.id,
        name=row.name,
        quantity=row.quantity,
        unit_price=row.unit_price,
        total_price=row.total_price,
    )


def _to_domain(row: TransactionModel) -> Transaction:
    return Transaction(
        id=row.id,
        customer_id=row.customer_id,
        type=row.type,
        amount=row.amount,
        description=row.description,
        store=row.store,
        created_at=row.created_at,
        items=[_item_to_domain(item) for item in row.items],
    )


class SqlAlchemyTransactionRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def list_for_customer(self, customer_id: str, *, limit: int, offset: int) -> list[Transaction]:
        rows = (
            self._db.query(TransactionModel)
            .options(joinedload(TransactionModel.items))
            .filter(TransactionModel.customer_id == customer_id)
            .order_by(desc(TransactionModel.created_at))
            .limit(clamp_limit(limit))
            .offset(offset)
            .all()
        )
        return [_to_domain(row) for row in rows]
