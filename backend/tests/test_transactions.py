from datetime import datetime, timedelta

from app.models import Transaction


def _create_transactions(db_session, customer, count):
    for _ in range(count):
        db_session.add(
            Transaction(
                customer_id=customer.id,
                type="credit",
                amount="10.00",
                description="Compra teste",
            )
        )
    db_session.commit()


def test_transactions_list_is_capped_even_without_query_params(client, db_session, make_customer, auth_headers):
    customer = make_customer()
    _create_transactions(db_session, customer, count=150)

    response = client.get("/api/v1/transactions", headers=auth_headers(customer.id))

    assert response.status_code == 200
    assert len(response.json()) <= 100


def test_transactions_offset_reaches_records_beyond_the_first_page(client, db_session, make_customer, auth_headers):
    """Sem offset, um cliente com mais de 100 transações nunca conseguiria ver as
    mais antigas — a página 1 sempre cobre o mesmo teto de 100 registros."""
    customer = make_customer()
    base = datetime(2026, 1, 1, 12, 0, 0)
    for i in range(150):
        db_session.add(
            Transaction(
                customer_id=customer.id,
                type="credit",
                amount="10.00",
                description=f"Compra {i}",
                created_at=base - timedelta(minutes=i),  # i=0 é a mais recente
            )
        )
    db_session.commit()

    first_page = client.get(
        "/api/v1/transactions", params={"limit": 100, "offset": 0}, headers=auth_headers(customer.id)
    )
    second_page = client.get(
        "/api/v1/transactions", params={"limit": 100, "offset": 100}, headers=auth_headers(customer.id)
    )

    assert first_page.status_code == 200
    assert second_page.status_code == 200
    assert len(first_page.json()) == 100
    assert len(second_page.json()) == 50

    first_page_descriptions = {t["description"] for t in first_page.json()}
    second_page_descriptions = {t["description"] for t in second_page.json()}
    assert first_page_descriptions.isdisjoint(second_page_descriptions)
    # As mais antigas (Compra 100..149) só aparecem na segunda página
    assert "Compra 149" in second_page_descriptions
    assert "Compra 149" not in first_page_descriptions


def test_transactions_rejects_negative_offset_with_422(client, make_customer, auth_headers):
    customer = make_customer()

    response = client.get("/api/v1/transactions", params={"offset": -1}, headers=auth_headers(customer.id))

    assert response.status_code == 422
