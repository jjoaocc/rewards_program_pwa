import uuid
from datetime import datetime, timedelta
from decimal import Decimal

from app.application.push_use_cases import list_campaigns, search_customers, subscribe, unsubscribe
from app.domain.customer import Customer
from app.domain.push import PushCampaign
from tests.fakes.fake_customer_repository import FakeCustomerRepository
from tests.fakes.fake_push_campaign_repository import FakePushCampaignRepository
from tests.fakes.fake_push_subscription_repository import FakePushSubscriptionRepository


def _make_customer(**overrides) -> Customer:
    defaults = {
        "id": "C0001",
        "name": "Cliente Teste",
        "email": "cliente@example.com",
        "secondary_email": None,
        "password_hash": "x",
        "document": "12345678900",
        "document_type": "cpf",
        "birth_date": None,
        "phone": None,
        "mobile": None,
        "balance": Decimal("0"),
        "is_active": True,
        "created_at": datetime(2026, 1, 1),
        "address": None,
    }
    defaults.update(overrides)
    return Customer(**defaults)


def test_subscribe_creates_a_new_subscription():
    repo = FakePushSubscriptionRepository()

    sub, created = subscribe(repo, "C0001", "https://push.example.com/a", "p256dh", "auth", None)

    assert created is True
    assert sub.customer_id == "C0001"


def test_subscribe_reassigns_existing_endpoint_to_new_customer():
    repo = FakePushSubscriptionRepository()
    subscribe(repo, "C0001", "https://push.example.com/a", "p256dh", "auth", None)

    sub, created = subscribe(repo, "C0002", "https://push.example.com/a", "p256dh-2", "auth-2", None)

    assert created is False
    assert sub.customer_id == "C0002"


def test_unsubscribe_removes_only_the_given_customers_subscriptions():
    repo = FakePushSubscriptionRepository()
    subscribe(repo, "C0001", "https://push.example.com/a", "p", "a", None)
    subscribe(repo, "C0002", "https://push.example.com/b", "p", "a", None)

    deleted = unsubscribe(repo, "C0001")

    assert deleted == 1


def test_search_customers_delegates_to_the_repository():
    repo = FakeCustomerRepository(
        [
            _make_customer(name="Furadeira Cliente"),
            _make_customer(id="C0002", email="outro@example.com", name="Outro"),
        ]
    )

    result = search_customers(repo, "Furadeira")

    assert len(result) == 1
    assert result[0].name == "Furadeira Cliente"


def _make_campaign(**overrides) -> PushCampaign:
    defaults = {
        "id": uuid.uuid4(),
        "title": "Campanha",
        "message": "Mensagem",
        "url": "/",
        "target_type": "broadcast",
        "target_customer_ids": None,
        "customers_targeted": 10,
        "sent": 10,
        "failed": 0,
        "removed": 0,
        "created_at": datetime(2026, 1, 1),
    }
    defaults.update(overrides)
    return PushCampaign(**defaults)


def test_list_campaigns_orders_by_most_recent_first():
    old = _make_campaign(title="Antiga", created_at=datetime(2026, 1, 1))
    new = _make_campaign(title="Recente", created_at=datetime(2026, 1, 2))
    repo = FakePushCampaignRepository([old, new])

    result = list_campaigns(repo)

    assert [c.title for c in result] == ["Recente", "Antiga"]


def test_list_campaigns_respects_limit():
    campaigns = [_make_campaign(created_at=datetime(2026, 1, 1) + timedelta(days=i)) for i in range(5)]
    repo = FakePushCampaignRepository(campaigns)

    result = list_campaigns(repo, limit=2)

    assert len(result) == 2
