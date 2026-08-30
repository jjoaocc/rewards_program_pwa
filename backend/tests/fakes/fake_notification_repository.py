import dataclasses
import uuid
from datetime import datetime

from app.core.pagination import clamp_limit
from app.domain.notification import Notification


class FakeNotificationRepository:
    def __init__(self, notifications: list[Notification] | None = None) -> None:
        self._notifications = {n.id: n for n in (notifications or [])}

    def list_for_customer(
        self, customer_id: str, *, unread_only: bool = False, limit: int = 50
    ) -> list[Notification]:
        results = [n for n in self._notifications.values() if n.customer_id == customer_id]
        if unread_only:
            results = [n for n in results if not n.read]
        results = sorted(results, key=lambda n: n.created_at, reverse=True)
        return results[: clamp_limit(limit)]

    def mark_as_read(self, customer_id: str, notification_ids: list[str]) -> list[Notification]:
        updated = []
        for nid in notification_ids:
            uid = uuid.UUID(nid) if isinstance(nid, str) else nid
            notification = self._notifications.get(uid)
            if notification and notification.customer_id == customer_id:
                new_notification = _with_read(notification, True)
                self._notifications[uid] = new_notification
                updated.append(new_notification)
        return updated

    def mark_all_as_read(self, customer_id: str) -> int:
        count = 0
        for nid, notification in list(self._notifications.items()):
            if notification.customer_id == customer_id and not notification.read:
                self._notifications[nid] = _with_read(notification, True)
                count += 1
        return count

    def delete(self, customer_id: str, notification_id: str) -> bool:
        uid = uuid.UUID(notification_id) if isinstance(notification_id, str) else notification_id
        notification = self._notifications.get(uid)
        if not notification or notification.customer_id != customer_id:
            return False
        del self._notifications[uid]
        return True

    def create(
        self, customer_id: str, title: str, message: str, *, type: str = "system", action_url: str | None = None
    ) -> Notification:
        notification = Notification(
            id=uuid.uuid4(),
            customer_id=customer_id,
            title=title,
            message=message,
            type=type,
            read=False,
            image_url=None,
            action_url=action_url,
            created_at=datetime.now(),
        )
        self._notifications[notification.id] = notification
        return notification


def _with_read(notification: Notification, read: bool) -> Notification:
    return dataclasses.replace(notification, read=read)
