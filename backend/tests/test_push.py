from app.models import PushSubscription


def test_get_vapid_public_key_does_not_require_auth(client):
    response = client.get("/api/v1/push/vapid-public-key")

    assert response.status_code == 200
    assert "public_key" in response.json()


def test_subscribe_creates_a_new_subscription(client, make_customer, auth_headers):
    customer = make_customer()

    response = client.post(
        "/api/v1/push/subscribe",
        json={"endpoint": "https://push.example.com/a", "p256dh": "key1", "auth": "auth1"},
        headers=auth_headers(customer.id),
    )

    assert response.status_code == 201
    assert response.json()["message"] == "Subscription registrada"


def test_subscribe_updates_existing_subscription_for_same_endpoint(client, db_session, make_customer, auth_headers):
    customer = make_customer()
    db_session.add(
        PushSubscription(
            customer_id=customer.id,
            endpoint="https://push.example.com/a",
            p256dh="old-key",
            auth="old-auth",
        )
    )
    db_session.commit()

    response = client.post(
        "/api/v1/push/subscribe",
        json={"endpoint": "https://push.example.com/a", "p256dh": "new-key", "auth": "new-auth"},
        headers=auth_headers(customer.id),
    )

    assert response.status_code == 201
    assert response.json()["message"] == "Subscription atualizada"

    updated = db_session.query(PushSubscription).filter(PushSubscription.endpoint == "https://push.example.com/a").one()
    assert updated.p256dh == "new-key"


def test_subscribe_reassigns_ownership_when_another_customer_reuses_the_endpoint(
    client, db_session, make_customer, auth_headers
):
    """
    Cenário: mesmo navegador/dispositivo, dois clientes diferentes (ex: login trocado sem
    unsubscribe). Quem assina por último passa a ser o dono de verdade daquele endpoint —
    evita que um push endereçado ao dono antigo vaze pro dispositivo de outra pessoa.
    """
    owner = make_customer()
    other = make_customer()
    db_session.add(
        PushSubscription(
            customer_id=owner.id,
            endpoint="https://push.example.com/shared",
            p256dh="owner-key",
            auth="owner-auth",
        )
    )
    db_session.commit()

    response = client.post(
        "/api/v1/push/subscribe",
        json={"endpoint": "https://push.example.com/shared", "p256dh": "other-key", "auth": "other-auth"},
        headers=auth_headers(other.id),
    )

    assert response.status_code == 201
    row = (
        db_session.query(PushSubscription).filter(PushSubscription.endpoint == "https://push.example.com/shared").one()
    )
    assert row.customer_id == other.id
    assert row.p256dh == "other-key"


def test_subscribe_requires_authentication(client):
    response = client.post(
        "/api/v1/push/subscribe",
        json={"endpoint": "https://push.example.com/a", "p256dh": "key1", "auth": "auth1"},
    )

    assert response.status_code in (401, 403)


def test_unsubscribe_removes_all_subscriptions_of_customer(client, db_session, make_customer, auth_headers):
    customer = make_customer()
    db_session.add_all(
        [
            PushSubscription(customer_id=customer.id, endpoint="https://push.example.com/1", p256dh="k", auth="a"),
            PushSubscription(customer_id=customer.id, endpoint="https://push.example.com/2", p256dh="k", auth="a"),
        ]
    )
    db_session.commit()

    response = client.delete("/api/v1/push/unsubscribe", headers=auth_headers(customer.id))

    assert response.status_code == 200
    assert response.json() == {"message": "2 subscription(s) removida(s)"}
    assert db_session.query(PushSubscription).filter(PushSubscription.customer_id == customer.id).count() == 0
