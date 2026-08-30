from app.domain.product import Product, ProductFilters


class FakeProductRepository:
    def __init__(self, products: list[Product] | None = None) -> None:
        self._products = list(products or [])

    def list(self, filters: ProductFilters) -> list[Product]:
        results = self._products

        if filters.active_only:
            results = [p for p in results if p.active]

        if filters.in_stock:
            results = [p for p in results if p.stock > 0]

        if filters.category:
            results = [p for p in results if p.category == filters.category]

        if filters.min_points is not None:
            results = [p for p in results if p.points_cost >= filters.min_points]

        if filters.max_points is not None:
            results = [p for p in results if p.points_cost <= filters.max_points]

        return sorted(results, key=lambda p: p.points_cost)

    def get_by_id(self, product_id: str) -> Product | None:
        return next((p for p in self._products if str(p.id) == product_id), None)
