from app.domain.product import Product, ProductFilters
from app.ports.product_repository import ProductRepository


def list_products(repo: ProductRepository, filters: ProductFilters) -> list[Product]:
    return repo.list(filters)


def get_product(repo: ProductRepository, product_id: str) -> Product | None:
    return repo.get_by_id(product_id)
