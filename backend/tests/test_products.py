from app.models import Product


def test_products_list_is_capped_even_without_query_params(client, db_session):
    for i in range(150):
        db_session.add(
            Product(
                name=f"Produto {i}",
                description="Descrição teste",
                points_cost="10.00",
                category="ferramenta",
                stock=10,
                active=True,
            )
        )
    db_session.commit()

    response = client.get("/api/v1/products")

    assert response.status_code == 200
    assert len(response.json()) <= 100


def _make_product(db_session, **overrides):
    defaults = {
        "name": "Produto",
        "description": "Descrição",
        "points_cost": "10.00",
        "category": "ferramenta",
        "stock": 10,
        "active": True,
    }
    defaults.update(overrides)
    product = Product(**defaults)
    db_session.add(product)
    db_session.commit()
    return product


def test_products_filters_by_category(client, db_session):
    _make_product(db_session, name="Furadeira", category="ferramenta")
    _make_product(db_session, name="Cimento", category="material")

    response = client.get("/api/v1/products", params={"category": "material"})

    assert response.status_code == 200
    names = [p["name"] for p in response.json()]
    assert names == ["Cimento"]


def test_products_filters_by_points_range(client, db_session):
    _make_product(db_session, name="Barato", points_cost="10.00")
    _make_product(db_session, name="Caro", points_cost="500.00")

    response = client.get("/api/v1/products", params={"min_points": 100, "max_points": 1000})

    assert response.status_code == 200
    names = [p["name"] for p in response.json()]
    assert names == ["Caro"]


def test_products_filters_by_max_points_zero_instead_of_ignoring_the_filter(client, db_session):
    """Decimal('0') é falsy em Python — um `if max_points:` simples ignoraria o filtro
    silenciosamente em vez de aplicar `points_cost <= 0`."""
    _make_product(db_session, name="Grátis", points_cost="0.00")
    _make_product(db_session, name="Pago", points_cost="10.00")

    response = client.get("/api/v1/products", params={"max_points": 0})

    assert response.status_code == 200
    names = [p["name"] for p in response.json()]
    assert names == ["Grátis"]


def test_products_in_stock_excludes_zero_stock_by_default(client, db_session):
    _make_product(db_session, name="Disponível", stock=5)
    _make_product(db_session, name="Esgotado", stock=0)

    response = client.get("/api/v1/products")

    assert response.status_code == 200
    names = [p["name"] for p in response.json()]
    assert names == ["Disponível"]


def test_get_product_detail_returns_product(client, db_session):
    product = _make_product(db_session, name="Furadeira")

    response = client.get(f"/api/v1/products/{product.id}")

    assert response.status_code == 200
    assert response.json()["name"] == "Furadeira"


def test_get_product_detail_returns_404_when_not_found(client):
    response = client.get("/api/v1/products/00000000-0000-0000-0000-000000000000")

    assert response.status_code == 404
