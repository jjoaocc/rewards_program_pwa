from typing import Protocol

from app.domain.notification import Notification


class NotificationRepository(Protocol):
    def list_for_customer(
        self, customer_id: str, *, unread_only: bool = False, limit: int = 50
    ) -> list[Notification]: ...

    def mark_as_read(self, customer_id: str, notification_ids: list[str]) -> list[Notification]: ...

    def mark_all_as_read(self, customer_id: str) -> int: ...

    def delete(self, customer_id: str, notification_id: str) -> bool:
        """Retorna False se a notificação não existir ou pertencer a outro cliente."""
        ...

    def create(
        self, customer_id: str, title: str, message: str, *, type: str = "system", action_url: str | None = None
    ) -> Notification: ...
