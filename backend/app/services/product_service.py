from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.pagination import MAX_PAGE_SIZE
from app.models import Product


def list_products(
    db: Session,
    *,
    category: str | None = None,
    min_points: Decimal | None = None,
    max_points: Decimal | None = None,
    in_stock: bool = True,
    active_only: bool = True,
) -> list[Product]:
    query = db.query(Product)

    if active_only:
        query = query.filter(Product.active.is_(True))

    if in_stock:
        query = query.filter(Product.stock > 0)

    if category:
        query = query.filter(Product.category == category)

    if min_points is not None:
        query = query.filter(Product.points_cost >= min_points)

    if max_points is not None:
        query = query.filter(Product.points_cost <= max_points)

    return query.order_by(Product.points_cost).limit(MAX_PAGE_SIZE).all()


def get_product_by_id(db: Session, product_id: str) -> Product | None:
    return db.query(Product).filter(Product.id == product_id).first()
