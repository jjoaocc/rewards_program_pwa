from app.domain.notification import Notification
from app.ports.notification_repository import NotificationRepository


def list_notifications(
    repo: NotificationRepository, customer_id: str, *, unread_only: bool = False, limit: int = 50
) -> list[Notification]:
    return repo.list_for_customer(customer_id, unread_only=unread_only, limit=limit)


def mark_as_read(repo: NotificationRepository, customer_id: str, notification_ids: list[str]) -> list[Notification]:
    return repo.mark_as_read(customer_id, notification_ids)


def mark_all_as_read(repo: NotificationRepository, customer_id: str) -> int:
    return repo.mark_all_as_read(customer_id)


def delete_notification(repo: NotificationRepository, customer_id: str, notification_id: str) -> bool:
    return repo.delete(customer_id, notification_id)
