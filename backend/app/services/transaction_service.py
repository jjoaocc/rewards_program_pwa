from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload

from app.core.pagination import MAX_PAGE_SIZE
from app.models import Transaction


def list_transactions(
    db: Session, customer_id: str, *, limit: int = MAX_PAGE_SIZE, offset: int = 0
) -> list[Transaction]:
    return (
        db.query(Transaction)
        .options(joinedload(Transaction.items))
        .filter(Transaction.customer_id == customer_id)
        .order_by(desc(Transaction.created_at))
        .limit(min(limit, MAX_PAGE_SIZE))
        .offset(offset)
        .all()
    )
