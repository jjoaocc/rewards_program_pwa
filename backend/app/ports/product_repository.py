from typing import Protocol

from app.domain.product import Product, ProductFilters


class ProductRepository(Protocol):
    def list(self, filters: ProductFilters) -> list[Product]: ...

    def get_by_id(self, product_id: str) -> Product | None: ...
