import os

from app.models import Notification, PushSubscription


def test_send_without_admin_header_is_forbidden(client):
    response = client.post(
        "/api/v1/push/send",
        json={"customer_id": "7742", "title": "Oi", "message": "Teste", "url": "/"},
    )

    assert response.status_code == 403


def test_send_with_wrong_admin_header_is_forbidden(client):
    response = client.post(
        "/api/v1/push/send",
        json={"customer_id": "7742", "title": "Oi", "message": "Teste", "url": "/"},
        headers={"X-Admin-Secret": "secret-errado"},
    )

    assert response.status_code == 403


def test_send_with_correct_admin_header_is_allowed(client, make_customer):
    customer = make_customer()

    response = client.post(
        "/api/v1/push/send",
        json={"customer_id": customer.id, "title": "Oi", "message": "Teste", "url": "/"},
        headers={"X-Admin-Secret": os.environ["PUSH_ADMIN_SECRET"]},
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Push enviado", "sent": 0, "failed": 0, "removed": 0}


def test_send_returns_404_for_unknown_customer(client):
    response = client.post(
        "/api/v1/push/send",
        json={"customer_id": "nao-existe", "title": "Oi", "message": "Teste", "url": "/"},
        headers={"X-Admin-Secret": os.environ["PUSH_ADMIN_SECRET"]},
    )

    assert response.status_code == 404


def test_send_also_creates_an_in_app_notification(client, db_session, make_customer):
    customer = make_customer()

    response = client.post(
        "/api/v1/push/send",
        json={"customer_id": customer.id, "title": "Promoção especial", "message": "20% OFF hoje", "url": "/"},
        headers={"X-Admin-Secret": os.environ["PUSH_ADMIN_SECRET"]},
    )

    assert response.status_code == 200
    notification = db_session.query(Notification).filter(Notification.customer_id == customer.id).one()
    assert notification.title == "Promoção especial"
    assert notification.message == "20% OFF hoje"
    assert notification.type == "system"
    assert notification.action_url == "/"
    assert notification.read is False


def test_broadcast_without_admin_header_is_forbidden(client):
    response = client.post(
        "/api/v1/push/broadcast",
        json={"title": "Oi", "message": "Teste", "url": "/"},
    )

    assert response.status_code == 403


def test_broadcast_targets_every_customer_with_a_subscription(client, db_session, make_customer, monkeypatch):
    monkeypatch.setattr("app.core.push.webpush", lambda **kwargs: None)
    customer_a = make_customer()
    customer_b = make_customer()
    db_session.add_all(
        [
            PushSubscription(customer_id=customer_a.id, endpoint="https://push.example.com/a", p256dh="k", auth="a"),
            PushSubscription(customer_id=customer_b.id, endpoint="https://push.example.com/b", p256dh="k", auth="a"),
        ]
    )
    db_session.commit()

    response = client.post(
        "/api/v1/push/broadcast",
        json={"title": "Oi", "message": "Teste", "url": "/"},
        headers={"X-Admin-Secret": os.environ["PUSH_ADMIN_SECRET"]},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["customers_targeted"] == 2

    notifications = db_session.query(Notification).filter(Notification.customer_id.in_([customer_a.id, customer_b.id]))
    assert notifications.count() == 2


def test_broadcast_creates_notifications_without_one_commit_per_customer(
    client, db_session, make_customer, monkeypatch
):
    """Antes, cada notificação de um broadcast era um INSERT + commit individual —
    N clientes = N commits (e N re-queries de subscription no envio). Agora o número
    de commits é uma constante pequena (insere notificações+campanha, depois atualiza
    as estatísticas da campanha), não O(N)."""
    monkeypatch.setattr("app.core.push.webpush", lambda **kwargs: None)
    customers = [make_customer() for _ in range(5)]
    for c in customers:
        db_session.add(
            PushSubscription(customer_id=c.id, endpoint=f"https://push.example.com/{c.id}", p256dh="k", auth="a")
        )
    db_session.commit()

    commit_calls = []
    original_commit = db_session.commit

    def _counting_commit():
        commit_calls.append(1)
        return original_commit()

    monkeypatch.setattr(db_session, "commit", _counting_commit)

    response = client.post(
        "/api/v1/push/broadcast",
        json={"title": "Oi", "message": "Teste", "url": "/"},
        headers={"X-Admin-Secret": os.environ["PUSH_ADMIN_SECRET"]},
    )

    assert response.status_code == 200
    assert response.json()["customers_targeted"] == 5
    assert len(commit_calls) == 2


def test_broadcast_with_no_subscriptions_targets_nobody(client):
    response = client.post(
        "/api/v1/push/broadcast",
        json={"title": "Oi", "message": "Teste", "url": "/"},
        headers={"X-Admin-Secret": os.environ["PUSH_ADMIN_SECRET"]},
    )

    assert response.status_code == 200
    assert response.json() == {"customers_targeted": 0, "sent": 0, "failed": 0, "removed": 0}


# ── /push/admin/login ───────────────────────────────────────────────────────


def test_admin_login_with_correct_secret_returns_a_token(client):
    response = client.post("/api/v1/push/admin/login", json={"secret": os.environ["PUSH_ADMIN_SECRET"]})

    assert response.status_code == 200
    assert response.json()["token"]


def test_admin_login_with_wrong_secret_is_forbidden(client):
    response = client.post("/api/v1/push/admin/login", json={"secret": "secret-errado"})

    assert response.status_code == 403


def test_admin_bearer_token_from_login_works_on_protected_endpoints(client, make_customer):
    customer = make_customer()
    login_response = client.post("/api/v1/push/admin/login", json={"secret": os.environ["PUSH_ADMIN_SECRET"]})
    token = login_response.json()["token"]

    response = client.post(
        "/api/v1/push/send",
        json={"customer_id": customer.id, "title": "Oi", "message": "Teste", "url": "/"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200


def test_admin_bearer_token_garbage_is_forbidden(client):
    response = client.post(
        "/api/v1/push/broadcast",
        json={"title": "Oi", "message": "Teste", "url": "/"},
        headers={"Authorization": "Bearer token-invalido"},
    )

    assert response.status_code == 403


# ── /push/admin/customers ───────────────────────────────────────────────────


def test_admin_search_customers_requires_authentication(client):
    response = client.get("/api/v1/push/admin/customers")

    assert response.status_code == 403


def test_admin_search_customers_matches_name_email_or_id(client, make_customer):
    make_customer(name="Maria Souza", email="maria@example.com")
    other = make_customer(name="João Pereira", email="joao@example.com")

    response = client.get(
        "/api/v1/push/admin/customers",
        params={"search": "maria"},
        headers={"X-Admin-Secret": os.environ["PUSH_ADMIN_SECRET"]},
    )

    assert response.status_code == 200
    names = [c["name"] for c in response.json()]
    assert names == ["Maria Souza"]

    response_by_id = client.get(
        "/api/v1/push/admin/customers",
        params={"search": other.id},
        headers={"X-Admin-Secret": os.environ["PUSH_ADMIN_SECRET"]},
    )
    assert [c["id"] for c in response_by_id.json()] == [other.id]


def test_admin_search_customers_without_search_term_lists_customers(client, make_customer):
    make_customer(name="Cliente Um")

    response = client.get(
        "/api/v1/push/admin/customers",
        headers={"X-Admin-Secret": os.environ["PUSH_ADMIN_SECRET"]},
    )

    assert response.status_code == 200
    assert len(response.json()) >= 1


# ── /push/send-bulk ──────────────────────────────────────────────────────────


def test_send_bulk_without_admin_header_is_forbidden(client):
    response = client.post(
        "/api/v1/push/send-bulk",
        json={"customer_ids": ["7742"], "title": "Oi", "message": "Teste", "url": "/"},
    )

    assert response.status_code == 403


def test_send_bulk_targets_only_existing_customers_and_reports_the_rest(client, db_session, make_customer):
    customer_a = make_customer()
    customer_b = make_customer()

    response = client.post(
        "/api/v1/push/send-bulk",
        json={
            "customer_ids": [customer_a.id, customer_b.id, "nao-existe"],
            "title": "Oi",
            "message": "Teste",
            "url": "/",
        },
        headers={"X-Admin-Secret": os.environ["PUSH_ADMIN_SECRET"]},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["customers_targeted"] == 2
    assert body["not_found"] == ["nao-existe"]

    notifications = db_session.query(Notification).filter(Notification.customer_id.in_([customer_a.id, customer_b.id]))
    assert notifications.count() == 2


# ── /push/admin/campaigns ────────────────────────────────────────────────────


def test_admin_campaigns_requires_authentication(client):
    response = client.get("/api/v1/push/admin/campaigns")

    assert response.status_code == 403


def test_admin_campaigns_lists_recent_sends_most_recent_first(client, make_customer):
    customer = make_customer()

    client.post(
        "/api/v1/push/send",
        json={"customer_id": customer.id, "title": "Individual", "message": "m", "url": "/"},
        headers={"X-Admin-Secret": os.environ["PUSH_ADMIN_SECRET"]},
    )
    client.post(
        "/api/v1/push/broadcast",
        json={"title": "Broadcast", "message": "m", "url": "/"},
        headers={"X-Admin-Secret": os.environ["PUSH_ADMIN_SECRET"]},
    )

    response = client.get(
        "/api/v1/push/admin/campaigns",
        headers={"X-Admin-Secret": os.environ["PUSH_ADMIN_SECRET"]},
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert body[0]["target_type"] == "broadcast"
    assert body[1]["target_type"] == "individual"
    assert body[1]["customers_targeted"] == 1
