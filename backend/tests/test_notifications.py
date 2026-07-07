from app.models import Notification


def _create_notifications(db_session, customer, count):
    for i in range(count):
        db_session.add(
            Notification(
                customer_id=customer.id,
                title=f"Notificação {i}",
                message="Mensagem teste",
                type="system",
            )
        )
    db_session.commit()


def test_notifications_default_limit_is_capped(client, db_session, make_customer, auth_headers):
    customer = make_customer()
    _create_notifications(db_session, customer, count=150)

    response = client.get("/api/v1/notifications", headers=auth_headers(customer.id))

    assert response.status_code == 200
    assert len(response.json()) <= 100


def test_notifications_client_cannot_request_more_than_the_cap(client, db_session, make_customer, auth_headers):
    customer = make_customer()
    _create_notifications(db_session, customer, count=150)

    response = client.get(
        "/api/v1/notifications",
        params={"limit": 999999},
        headers=auth_headers(customer.id),
    )

    assert response.status_code == 200
    assert len(response.json()) <= 100


def test_notifications_rejects_negative_limit_with_422_instead_of_crashing(client, make_customer, auth_headers):
    customer = make_customer()

    response = client.get(
        "/api/v1/notifications",
        params={"limit": -1},
        headers=auth_headers(customer.id),
    )

    assert response.status_code == 422


def test_notifications_unread_only_filters_read_ones(client, db_session, make_customer, auth_headers):
    customer = make_customer()
    db_session.add_all(
        [
            Notification(customer_id=customer.id, title="Lida", message="m", type="system", read=True),
            Notification(customer_id=customer.id, title="Não lida", message="m", type="system", read=False),
        ]
    )
    db_session.commit()

    response = client.get("/api/v1/notifications", params={"unread_only": True}, headers=auth_headers(customer.id))

    assert response.status_code == 200
    titles = [n["title"] for n in response.json()]
    assert titles == ["Não lida"]


def test_mark_notifications_as_read_updates_only_the_given_ids(client, db_session, make_customer, auth_headers):
    customer = make_customer()
    n1 = Notification(customer_id=customer.id, title="A", message="m", type="system", read=False)
    n2 = Notification(customer_id=customer.id, title="B", message="m", type="system", read=False)
    db_session.add_all([n1, n2])
    db_session.commit()

    response = client.patch(
        "/api/v1/notifications/mark-read",
        json={"notification_ids": [str(n1.id)]},
        headers=auth_headers(customer.id),
    )

    assert response.status_code == 200
    assert response.json()["updated_count"] == 1
    db_session.refresh(n1)
    db_session.refresh(n2)
    assert n1.read is True
    assert n2.read is False


def test_mark_notifications_as_read_returns_404_when_none_found(client, make_customer, auth_headers):
    customer = make_customer()

    response = client.patch(
        "/api/v1/notifications/mark-read",
        json={"notification_ids": ["00000000-0000-0000-0000-000000000000"]},
        headers=auth_headers(customer.id),
    )

    assert response.status_code == 404


def test_mark_all_notifications_as_read(client, db_session, make_customer, auth_headers):
    customer = make_customer()
    db_session.add_all(
        [
            Notification(customer_id=customer.id, title="A", message="m", type="system", read=False),
            Notification(customer_id=customer.id, title="B", message="m", type="system", read=False),
        ]
    )
    db_session.commit()

    response = client.patch("/api/v1/notifications/mark-all-read", headers=auth_headers(customer.id))

    assert response.status_code == 200
    assert response.json()["updated_count"] == 2


def test_delete_notification_removes_it_for_the_owner(client, db_session, make_customer, auth_headers):
    customer = make_customer()
    notification = Notification(customer_id=customer.id, title="A", message="m", type="system")
    db_session.add(notification)
    db_session.commit()
    notification_id = str(notification.id)

    response = client.delete(f"/api/v1/notifications/{notification_id}", headers=auth_headers(customer.id))

    assert response.status_code == 200
    assert db_session.query(Notification).filter(Notification.id == notification_id).first() is None


def test_delete_notification_does_not_affect_other_notifications_of_the_same_customer(
    client, db_session, make_customer, auth_headers
):
    customer = make_customer()
    keep = Notification(customer_id=customer.id, title="Mantida", message="m", type="system")
    remove = Notification(customer_id=customer.id, title="Removida", message="m", type="system")
    db_session.add_all([keep, remove])
    db_session.commit()

    response = client.delete(f"/api/v1/notifications/{remove.id}", headers=auth_headers(customer.id))

    assert response.status_code == 200
    remaining = db_session.query(Notification).filter(Notification.customer_id == customer.id).all()
    assert [n.title for n in remaining] == ["Mantida"]


def test_delete_notification_returns_404_for_nonexistent_id(client, make_customer, auth_headers):
    customer = make_customer()

    response = client.delete(
        "/api/v1/notifications/00000000-0000-0000-0000-000000000000",
        headers=auth_headers(customer.id),
    )

    assert response.status_code == 404


def test_delete_notification_of_another_customer_returns_404_and_does_not_delete_it(
    client, db_session, make_customer, auth_headers
):
    owner = make_customer()
    other = make_customer()
    notification = Notification(customer_id=owner.id, title="Da outra pessoa", message="m", type="system")
    db_session.add(notification)
    db_session.commit()
    notification_id = str(notification.id)

    response = client.delete(f"/api/v1/notifications/{notification_id}", headers=auth_headers(other.id))

    assert response.status_code == 404
    assert db_session.query(Notification).filter(Notification.id == notification_id).first() is not None


def test_delete_notification_requires_authentication(client, make_customer, db_session):
    customer = make_customer()
    notification = Notification(customer_id=customer.id, title="A", message="m", type="system")
    db_session.add(notification)
    db_session.commit()

    response = client.delete(f"/api/v1/notifications/{notification.id}")

    assert response.status_code in (401, 403)
