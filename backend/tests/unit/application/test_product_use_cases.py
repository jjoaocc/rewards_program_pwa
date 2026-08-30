import uuid
from datetime import datetime
from decimal import Decimal

from app.application.product_use_cases import get_product, list_products
from app.domain.product import Product, ProductFilters
from tests.fakes.fake_product_repository import FakeProductRepository


def _make_product(**overrides) -> Product:
    defaults = {
        "id": uuid.uuid4(),
        "name": "Produto",
        "description": "Descrição",
        "points_cost": Decimal("10.00"),
        "category": "ferramenta",
        "stock": 10,
        "active": True,
        "image_url": None,
        "created_at": datetime(2026, 1, 1),
    }
    defaults.update(overrides)
    return Product(**defaults)


def test_list_products_returns_all_when_no_filters_narrow_them_out():
    repo = FakeProductRepository([_make_product(name="A"), _make_product(name="B")])

    result = list_products(repo, ProductFilters())

    assert {p.name for p in result} == {"A", "B"}


def test_list_products_filters_by_category():
    repo = FakeProductRepository(
        [_make_product(name="Furadeira", category="ferramenta"), _make_product(name="Cimento", category="material")]
    )

    result = list_products(repo, ProductFilters(category="material"))

    assert [p.name for p in result] == ["Cimento"]


def test_list_products_filters_by_points_range():
    repo = FakeProductRepository(
        [
            _make_product(name="Barato", points_cost=Decimal("10.00")),
            _make_product(name="Caro", points_cost=Decimal("500.00")),
        ]
    )

    result = list_products(repo, ProductFilters(min_points=Decimal("100"), max_points=Decimal("1000")))

    assert [p.name for p in result] == ["Caro"]


def test_list_products_max_points_zero_is_not_ignored():
    """Decimal('0') é falsy em Python, um filtro com `if filters.max_points:` simples
    ignoraria isso silenciosamente em vez de aplicar `points_cost <= 0`."""
    repo = FakeProductRepository(
        [_make_product(name="Grátis", points_cost=Decimal("0.00")), _make_product(name="Pago")]
    )

    result = list_products(repo, ProductFilters(max_points=Decimal("0")))

    assert [p.name for p in result] == ["Grátis"]


def test_list_products_excludes_out_of_stock_by_default():
    repo = FakeProductRepository([_make_product(name="Disponível", stock=5), _make_product(name="Esgotado", stock=0)])

    result = list_products(repo, ProductFilters())

    assert [p.name for p in result] == ["Disponível"]


def test_get_product_returns_none_when_not_found():
    repo = FakeProductRepository([])

    result = get_product(repo, str(uuid.uuid4()))

    assert result is None


def test_get_product_returns_the_matching_product():
    product = _make_product(name="Furadeira")
    repo = FakeProductRepository([product])

    result = get_product(repo, str(product.id))

    assert result is not None
    assert result.name == "Furadeira"
