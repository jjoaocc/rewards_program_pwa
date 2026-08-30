import uuid
from datetime import datetime

from app.application.notification_use_cases import (
    delete_notification,
    list_notifications,
    mark_all_as_read,
    mark_as_read,
)
from app.domain.notification import Notification
from tests.fakes.fake_notification_repository import FakeNotificationRepository


def _make_notification(**overrides) -> Notification:
    defaults = {
        "id": uuid.uuid4(),
        "customer_id": "C0001",
        "title": "Título",
        "message": "Mensagem",
        "type": "system",
        "read": False,
        "image_url": None,
        "action_url": None,
        "created_at": datetime(2026, 1, 1),
    }
    defaults.update(overrides)
    return Notification(**defaults)


def test_list_notifications_only_returns_the_given_customers():
    repo = FakeNotificationRepository(
        [_make_notification(customer_id="C0001"), _make_notification(customer_id="C0002")]
    )

    result = list_notifications(repo, "C0001")

    assert len(result) == 1
    assert result[0].customer_id == "C0001"


def test_list_notifications_unread_only_excludes_read():
    repo = FakeNotificationRepository(
        [_make_notification(title="Lida", read=True), _make_notification(title="Não lida", read=False)]
    )

    result = list_notifications(repo, "C0001", unread_only=True)

    assert [n.title for n in result] == ["Não lida"]


def test_mark_as_read_updates_only_the_given_customers_notifications():
    mine = _make_notification(customer_id="C0001")
    others = _make_notification(customer_id="C0002")
    repo = FakeNotificationRepository([mine, others])

    result = mark_as_read(repo, "C0001", [str(mine.id), str(others.id)])

    assert len(result) == 1
    assert result[0].id == mine.id
    assert result[0].read is True


def test_mark_all_as_read_returns_count_of_updated():
    repo = FakeNotificationRepository(
        [
            _make_notification(customer_id="C0001", read=False),
            _make_notification(customer_id="C0001", read=False),
            _make_notification(customer_id="C0001", read=True),
        ]
    )

    updated = mark_all_as_read(repo, "C0001")

    assert updated == 2


def test_delete_notification_returns_false_for_another_customers_notification():
    notification = _make_notification(customer_id="C0002")
    repo = FakeNotificationRepository([notification])

    result = delete_notification(repo, "C0001", str(notification.id))

    assert result is False


def test_delete_notification_returns_true_when_deleted():
    notification = _make_notification(customer_id="C0001")
    repo = FakeNotificationRepository([notification])

    result = delete_notification(repo, "C0001", str(notification.id))

    assert result is True
