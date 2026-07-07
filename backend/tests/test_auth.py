from app.core.security import get_password_hash


def test_login_succeeds_with_correct_email_and_password(client, make_customer):
    customer = make_customer(password_hash=get_password_hash("senha123"))

    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": customer.email, "password": "senha123"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_succeeds_with_customer_id_as_identifier(client, make_customer):
    customer = make_customer(password_hash=get_password_hash("senha123"))

    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": customer.id, "password": "senha123"},
    )

    assert response.status_code == 200


def test_login_rejects_password_over_72_bytes_with_422_instead_of_500(client, make_customer):
    customer = make_customer(password_hash=get_password_hash("senha123"))

    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": customer.email, "password": "a" * 100},
    )

    assert response.status_code == 422


def test_login_fails_with_wrong_password(client, make_customer):
    customer = make_customer(password_hash=get_password_hash("senha123"))

    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": customer.email, "password": "senha-errada"},
    )

    assert response.status_code == 401


def test_login_fails_for_unknown_identifier(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "nao-existe@example.com", "password": "qualquer"},
    )

    assert response.status_code == 401


def test_login_fails_for_inactive_customer(client, make_customer):
    customer = make_customer(password_hash=get_password_hash("senha123"), is_active=False)

    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": customer.email, "password": "senha123"},
    )

    assert response.status_code == 403


def test_me_returns_current_customer_with_valid_token(client, make_customer, auth_headers):
    customer = make_customer()

    response = client.get("/api/v1/auth/me", headers=auth_headers(customer.id))

    assert response.status_code == 200
    assert response.json()["id"] == customer.id


def test_me_requires_authentication(client):
    response = client.get("/api/v1/auth/me")

    assert response.status_code in (401, 403)


def test_me_rejects_invalid_token(client):
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer token-invalido"})

    assert response.status_code == 401


def test_me_rejects_token_for_customer_that_no_longer_exists(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers("nao-existe"))

    assert response.status_code == 401


def test_me_rejects_token_for_inactive_customer(client, make_customer, auth_headers):
    customer = make_customer(is_active=False)

    response = client.get("/api/v1/auth/me", headers=auth_headers(customer.id))

    assert response.status_code == 403
