from decimal import Decimal

from app.adapters.db.product_repository import SqlAlchemyProductRepository
from app.domain.product import ProductFilters
from app.models import Product as ProductModel


def _make_product(db_session, **overrides):
    defaults = {
        "name": "Produto",
        "description": "Descrição",
        "points_cost": Decimal("10.00"),
        "category": "ferramenta",
        "stock": 10,
        "active": True,
    }
    defaults.update(overrides)
    product = ProductModel(**defaults)
    db_session.add(product)
    db_session.commit()
    return product


def test_list_filters_by_category_against_real_postgres(db_session):
    _make_product(db_session, name="Furadeira", category="ferramenta")
    _make_product(db_session, name="Cimento", category="material")
    repo = SqlAlchemyProductRepository(db_session)

    result = repo.list(ProductFilters(category="material"))

    assert [p.name for p in result] == ["Cimento"]


def test_list_orders_by_points_cost_ascending(db_session):
    _make_product(db_session, name="Caro", points_cost=Decimal("500.00"))
    _make_product(db_session, name="Barato", points_cost=Decimal("10.00"))
    repo = SqlAlchemyProductRepository(db_session)

    result = repo.list(ProductFilters())

    assert [p.name for p in result] == ["Barato", "Caro"]


def test_list_excludes_inactive_by_default(db_session):
    _make_product(db_session, name="Ativo", active=True)
    _make_product(db_session, name="Inativo", active=False)
    repo = SqlAlchemyProductRepository(db_session)

    result = repo.list(ProductFilters())

    assert [p.name for p in result] == ["Ativo"]


def test_get_by_id_returns_the_domain_product(db_session):
    product = _make_product(db_session, name="Furadeira")
    repo = SqlAlchemyProductRepository(db_session)

    result = repo.get_by_id(str(product.id))

    assert result is not None
    assert result.name == "Furadeira"
    assert result.points_cost == Decimal("10.00")


def test_get_by_id_returns_none_when_not_found(db_session):
    repo = SqlAlchemyProductRepository(db_session)

    result = repo.get_by_id("00000000-0000-0000-0000-000000000000")

    assert result is None
