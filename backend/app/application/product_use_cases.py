from app.domain.product import Product, ProductFilters
from app.ports.product_repository import ProductRepository


class InvalidPointsRangeError(ValueError):
    """Filtro de pontos com faixa invertida (min_points maior que max_points)."""


def validate_points_range(filters: ProductFilters) -> None:
    if filters.min_points is not None and filters.max_points is not None and filters.min_points > filters.max_points:
        raise InvalidPointsRangeError("min_points não pode ser maior que max_points")


def list_products(repo: ProductRepository, filters: ProductFilters) -> list[Product]:
    validate_points_range(filters)
    return repo.list(filters)


def get_product(repo: ProductRepository, product_id: str) -> Product | None:
    return repo.get_by_id(product_id)
