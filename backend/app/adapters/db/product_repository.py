from sqlalchemy.orm import Session

from app.core.pagination import MAX_PAGE_SIZE
from app.domain.product import Product, ProductFilters
from app.models import Product as ProductModel


def _to_domain(row: ProductModel) -> Product:
    return Product(
        id=row.id,
        name=row.name,
        description=row.description,
        points_cost=row.points_cost,
        category=row.category,
        stock=row.stock,
        active=row.active,
        image_url=row.image_url,
        created_at=row.created_at,
    )


class SqlAlchemyProductRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def list(self, filters: ProductFilters) -> list[Product]:
        query = self._db.query(ProductModel)

        if filters.active_only:
            query = query.filter(ProductModel.active.is_(True))

        if filters.in_stock:
            query = query.filter(ProductModel.stock > 0)

        if filters.category:
            query = query.filter(ProductModel.category == filters.category)

        if filters.min_points is not None:
            query = query.filter(ProductModel.points_cost >= filters.min_points)

        if filters.max_points is not None:
            query = query.filter(ProductModel.points_cost <= filters.max_points)

        rows = query.order_by(ProductModel.points_cost).limit(MAX_PAGE_SIZE).all()
        return [_to_domain(row) for row in rows]

    def get_by_id(self, product_id: str) -> Product | None:
        row = self._db.query(ProductModel).filter(ProductModel.id == product_id).first()
        return _to_domain(row) if row else None
