from app.adapters.db.customer_repository import SqlAlchemyCustomerRepository
from app.adapters.db.notification_repository import SqlAlchemyNotificationRepository
from app.adapters.db.push_campaign_repository import SqlAlchemyPushCampaignRepository
from app.application.push_use_cases import broadcast, send_to_customer, send_to_customers
from app.models import Customer, Notification, PushSubscription


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


def _fake_sender(*, subscription_info, data, vapid_private_key, vapid_claims):
    pass


def test_send_to_customer_creates_notification_and_campaign(db_session):
    customer = _make_customer(db_session)
    db_session.add(PushSubscription(customer_id=customer.id, endpoint="https://a", p256dh="p", auth="a"))
    db_session.commit()
    notification_repo = SqlAlchemyNotificationRepository(db_session)
    campaign_repo = SqlAlchemyPushCampaignRepository(db_session)

    result = send_to_customer(
        db_session, customer.id, "Título", "Mensagem", "/", notification_repo, campaign_repo, sender=_fake_sender
    )

    assert result == {"sent": 1, "failed": 0, "removed": 0}
    notification = db_session.query(Notification).filter(Notification.customer_id == customer.id).first()
    assert notification is not None
    assert notification.title == "Título"
    campaigns = campaign_repo.list_recent(limit=1)
    assert campaigns[0].sent == 1
    assert campaigns[0].target_type == "individual"


def test_send_to_customers_reports_ids_that_do_not_exist(db_session):
    customer = _make_customer(db_session)
    customer_repo = SqlAlchemyCustomerRepository(db_session)
    campaign_repo = SqlAlchemyPushCampaignRepository(db_session)

    result = send_to_customers(
        db_session, [customer.id, "nao-existe"], "Título", "Mensagem", "/", customer_repo, campaign_repo,
        sender=_fake_sender,
    )

    assert result["customers_targeted"] == 1
    assert result["not_found"] == ["nao-existe"]
    notification = db_session.query(Notification).filter(Notification.customer_id == customer.id).first()
    assert notification is not None


def test_send_to_customers_batches_notifications_and_campaign_in_a_single_commit(db_session, monkeypatch):
    customers = [
        _make_customer(db_session, id=f"C000{i}", email=f"c{i}@example.com", document=f"{i:011d}")
        for i in range(3)
    ]
    customer_repo = SqlAlchemyCustomerRepository(db_session)
    campaign_repo = SqlAlchemyPushCampaignRepository(db_session)

    commit_calls = []
    original_commit = db_session.commit

    def _counting_commit():
        commit_calls.append(1)
        return original_commit()

    monkeypatch.setattr(db_session, "commit", _counting_commit)

    send_to_customers(
        db_session, [c.id for c in customers], "Título", "Mensagem", "/", customer_repo, campaign_repo,
        sender=_fake_sender,
    )

    assert len(commit_calls) == 2


def test_broadcast_targets_every_customer_with_a_subscription(db_session):
    customers = [
        _make_customer(db_session, id=f"C000{i}", email=f"c{i}@example.com", document=f"{i:011d}")
        for i in range(3)
    ]
    for c in customers:
        db_session.add(PushSubscription(customer_id=c.id, endpoint=f"https://{c.id}", p256dh="p", auth="a"))
    db_session.commit()
    campaign_repo = SqlAlchemyPushCampaignRepository(db_session)

    result = broadcast(db_session, "Título", "Mensagem", "/", campaign_repo, sender=_fake_sender)

    assert result["customers_targeted"] == 3
    assert result["sent"] == 3
    notifications = db_session.query(Notification).all()
    assert len(notifications) == 3


def test_broadcast_batches_notifications_and_campaign_in_a_single_commit(db_session, monkeypatch):
    customers = [
        _make_customer(db_session, id=f"C000{i}", email=f"c{i}@example.com", document=f"{i:011d}")
        for i in range(5)
    ]
    for c in customers:
        db_session.add(PushSubscription(customer_id=c.id, endpoint=f"https://{c.id}", p256dh="p", auth="a"))
    db_session.commit()
    campaign_repo = SqlAlchemyPushCampaignRepository(db_session)

    commit_calls = []
    original_commit = db_session.commit

    def _counting_commit():
        commit_calls.append(1)
        return original_commit()

    monkeypatch.setattr(db_session, "commit", _counting_commit)

    broadcast(db_session, "Título", "Mensagem", "/", campaign_repo, sender=_fake_sender)

    assert len(commit_calls) == 2
