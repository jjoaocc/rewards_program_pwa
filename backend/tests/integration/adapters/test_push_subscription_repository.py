from app.adapters.db.push_subscription_repository import SqlAlchemyPushSubscriptionRepository
from app.models import Customer, PushSubscription


def _make_customer(db_session, **overrides):
    defaults = {
        "id": "C0001",
        "name": "Cliente Teste",
        "email": "cliente@example.com",
        "password_hash": "x",
        "document": "12345678900",
        "document_type": "cpf",
    }
    defaults.update(overrides)
    customer = Customer(**defaults)
    db_session.add(customer)
    db_session.commit()
    return customer


def test_subscribe_creates_a_new_subscription(db_session):
    customer = _make_customer(db_session)
    repo = SqlAlchemyPushSubscriptionRepository(db_session)

    sub, created = repo.subscribe(customer.id, "https://push.example.com/a", "p256dh", "auth", None)

    assert created is True
    assert sub.customer_id == customer.id


def test_subscribe_reassigns_existing_endpoint_ownership(db_session):
    customer_a = _make_customer(db_session, id="C0001", email="a@example.com")
    customer_b = _make_customer(db_session, id="C0002", email="b@example.com", document="99999999999")
    repo = SqlAlchemyPushSubscriptionRepository(db_session)
    repo.subscribe(customer_a.id, "https://push.example.com/shared", "p", "a", None)

    sub, created = repo.subscribe(customer_b.id, "https://push.example.com/shared", "p2", "a2", None)

    assert created is False
    assert sub.customer_id == customer_b.id


def test_unsubscribe_removes_only_the_given_customer(db_session):
    customer_a = _make_customer(db_session, id="C0001", email="a@example.com")
    customer_b = _make_customer(db_session, id="C0002", email="b@example.com", document="99999999999")
    db_session.add(PushSubscription(customer_id=customer_a.id, endpoint="https://a", p256dh="p", auth="a"))
    db_session.add(PushSubscription(customer_id=customer_b.id, endpoint="https://b", p256dh="p", auth="a"))
    db_session.commit()
    repo = SqlAlchemyPushSubscriptionRepository(db_session)

    deleted = repo.unsubscribe(customer_a.id)

    assert deleted == 1
    remaining = db_session.query(PushSubscription).all()
    assert len(remaining) == 1
    assert remaining[0].customer_id == customer_b.id
