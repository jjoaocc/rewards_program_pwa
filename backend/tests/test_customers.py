from app.models import Address


def test_get_my_profile_returns_customer_data(client, make_customer, auth_headers):
    customer = make_customer(name="Maria Teste", phone="47999990000")

    response = client.get("/api/v1/customers/me", headers=auth_headers(customer.id))

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == customer.id
    assert body["name"] == "Maria Teste"
    assert body["address"] is None


def test_get_my_profile_includes_primary_address(client, db_session, make_customer, auth_headers):
    customer = make_customer()
    db_session.add(
        Address(
            customer_id=customer.id,
            zip_code="89200-000",
            street="Rua das Flores",
            number="100",
            neighborhood="Centro",
            city="Joinville",
            state="SC",
            is_primary=True,
        )
    )
    db_session.commit()

    response = client.get("/api/v1/customers/me", headers=auth_headers(customer.id))

    assert response.status_code == 200
    assert response.json()["address"]["city"] == "Joinville"


def test_get_my_profile_requires_authentication(client):
    response = client.get("/api/v1/customers/me")

    assert response.status_code in (401, 403)


def test_update_my_profile_changes_allowed_fields(client, make_customer, auth_headers):
    customer = make_customer(name="Nome Antigo")

    response = client.patch(
        "/api/v1/customers/me",
        json={"name": "Nome Novo", "phone": "47988887777"},
        headers=auth_headers(customer.id),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Nome Novo"
    assert body["phone"] == "47988887777"


def test_update_my_profile_changes_email(client, make_customer, auth_headers):
    customer = make_customer(email="antigo@example.com")

    response = client.patch(
        "/api/v1/customers/me",
        json={"email": "novo@example.com"},
        headers=auth_headers(customer.id),
    )

    assert response.status_code == 200
    assert response.json()["email"] == "novo@example.com"


def test_update_my_profile_rejects_email_already_in_use_by_another_customer(client, make_customer, auth_headers):
    make_customer(email="ocupado@example.com")
    customer = make_customer(email="livre@example.com")

    response = client.patch(
        "/api/v1/customers/me",
        json={"email": "ocupado@example.com"},
        headers=auth_headers(customer.id),
    )

    assert response.status_code == 409


def test_update_my_profile_rejects_invalid_email_format(client, make_customer, auth_headers):
    customer = make_customer()

    response = client.patch(
        "/api/v1/customers/me",
        json={"email": "isso-nao-e-um-email"},
        headers=auth_headers(customer.id),
    )

    assert response.status_code == 422


def test_update_my_profile_changes_secondary_email(client, make_customer, auth_headers):
    customer = make_customer()

    response = client.patch(
        "/api/v1/customers/me",
        json={"secondary_email": "secundario@example.com"},
        headers=auth_headers(customer.id),
    )

    assert response.status_code == 200
    assert response.json()["secondary_email"] == "secundario@example.com"


def test_update_my_profile_allows_clearing_secondary_email(client, make_customer, auth_headers):
    customer = make_customer(secondary_email="antigo@example.com")

    response = client.patch(
        "/api/v1/customers/me",
        json={"secondary_email": None},
        headers=auth_headers(customer.id),
    )

    assert response.status_code == 200
    assert response.json()["secondary_email"] is None


def test_get_my_profile_returns_secondary_email_when_set(client, make_customer, auth_headers):
    customer = make_customer(secondary_email="secundario@example.com")

    response = client.get("/api/v1/customers/me", headers=auth_headers(customer.id))

    assert response.status_code == 200
    assert response.json()["secondary_email"] == "secundario@example.com"


def test_get_my_stats_sums_credits_and_debits(client, db_session, make_customer, auth_headers):
    from app.models import Transaction

    customer = make_customer()
    db_session.add_all(
        [
            Transaction(customer_id=customer.id, type="credit", amount="100.00", description="Compra 1"),
            Transaction(customer_id=customer.id, type="credit", amount="50.00", description="Compra 2"),
            Transaction(customer_id=customer.id, type="debit", amount="30.00", description="Resgate 1"),
        ]
    )
    db_session.commit()

    response = client.get("/api/v1/customers/me/stats", headers=auth_headers(customer.id))

    assert response.status_code == 200
    body = response.json()
    assert body["total_earned"] == "150.00"
    assert body["total_redeemed"] == "30.00"
    assert body["transaction_count"] == 3


def test_get_my_stats_with_no_transactions_returns_zero(client, make_customer, auth_headers):
    customer = make_customer()

    response = client.get("/api/v1/customers/me/stats", headers=auth_headers(customer.id))

    assert response.status_code == 200
    body = response.json()
    # Nota: quando não há transações, o `sum(...) or 0` no router retorna um int puro
    # (não Decimal), que serializa como "0" em vez de "0.00" — comportamento atual
    # documentado aqui, não necessariamente o ideal.
    assert body["total_earned"] == "0"
    assert body["total_redeemed"] == "0"
    assert body["transaction_count"] == 0
