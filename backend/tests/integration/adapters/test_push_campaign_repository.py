from app.adapters.db.push_campaign_repository import SqlAlchemyPushCampaignRepository
from app.models import Customer, Notification


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


def test_create_and_notify_creates_campaign_and_one_notification_per_customer(db_session):
    customer_a = _make_customer(db_session, id="C0001", email="a@example.com")
    customer_b = _make_customer(db_session, id="C0002", email="b@example.com", document="99999999999")
    repo = SqlAlchemyPushCampaignRepository(db_session)

    campaign = repo.create_and_notify(
        "Título",
        "Mensagem",
        "/",
        target_type="selected",
        target_customer_ids=f"{customer_a.id},{customer_b.id}",
        customer_ids_to_notify=[customer_a.id, customer_b.id],
    )

    assert campaign.customers_targeted == 2
    notifications = db_session.query(Notification).all()
    assert {n.customer_id for n in notifications} == {customer_a.id, customer_b.id}


def test_create_and_notify_commits_campaign_and_notifications_together(db_session, monkeypatch):
    customer = _make_customer(db_session)
    repo = SqlAlchemyPushCampaignRepository(db_session)

    commit_calls = []
    original_commit = db_session.commit

    def _counting_commit():
        commit_calls.append(1)
        return original_commit()

    monkeypatch.setattr(db_session, "commit", _counting_commit)

    repo.create_and_notify(
        "Título", "Mensagem", "/", target_type="broadcast", target_customer_ids=None,
        customer_ids_to_notify=[customer.id],
    )

    assert len(commit_calls) == 1


def test_create_and_record_result_roundtrip(db_session):
    repo = SqlAlchemyPushCampaignRepository(db_session)

    campaign = repo.create(
        "Título", "Mensagem", "/", target_type="broadcast", target_customer_ids=None, customers_targeted=5
    )
    assert campaign.sent == 0

    repo.record_result(campaign.id, sent=4, failed=1, removed=0)

    updated = repo.list_recent(limit=1)[0]
    assert updated.id == campaign.id
    assert updated.sent == 4
    assert updated.failed == 1


def test_list_recent_orders_by_most_recent_first(db_session):
    repo = SqlAlchemyPushCampaignRepository(db_session)
    repo.create("Antiga", "m", "/", target_type="broadcast", target_customer_ids=None, customers_targeted=1)
    repo.create("Recente", "m", "/", target_type="broadcast", target_customer_ids=None, customers_targeted=1)

    result = repo.list_recent(limit=10)

    assert result[0].title == "Recente"
