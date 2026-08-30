from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.adapters.db.mapping import row_to_domain
from app.core.pagination import clamp_limit
from app.domain.notification import Notification
from app.models import Notification as NotificationModel


def _to_domain(row: NotificationModel) -> Notification:
    return row_to_domain(Notification, row)


class SqlAlchemyNotificationRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def list_for_customer(
        self, customer_id: str, *, unread_only: bool = False, limit: int = 50
    ) -> list[Notification]:
        query = self._db.query(NotificationModel).filter(NotificationModel.customer_id == customer_id)

        if unread_only:
            query = query.filter(~NotificationModel.read)

        capped_limit = clamp_limit(limit)
        rows = query.order_by(desc(NotificationModel.created_at)).limit(capped_limit).all()
        return [_to_domain(row) for row in rows]

    def mark_as_read(self, customer_id: str, notification_ids: list[str]) -> list[Notification]:
        rows = (
            self._db.query(NotificationModel)
            .filter(NotificationModel.id.in_(notification_ids), NotificationModel.customer_id == customer_id)
            .all()
        )

        for row in rows:
            row.read = True

        self._db.commit()
        return [_to_domain(row) for row in rows]

    def mark_all_as_read(self, customer_id: str) -> int:
        updated = (
            self._db.query(NotificationModel)
            .filter(NotificationModel.customer_id == customer_id, ~NotificationModel.read)
            .update({"read": True})
        )
        self._db.commit()
        return updated

    def delete(self, customer_id: str, notification_id: str) -> bool:
        deleted = (
            self._db.query(NotificationModel)
            .filter(NotificationModel.id == notification_id, NotificationModel.customer_id == customer_id)
            .delete()
        )
        self._db.commit()
        return bool(deleted)

    def create(
        self, customer_id: str, title: str, message: str, *, type: str = "system", action_url: str | None = None
    ) -> Notification:
        row = NotificationModel(customer_id=customer_id, title=title, message=message, type=type, action_url=action_url)
        self._db.add(row)
        self._db.commit()
        self._db.refresh(row)
        return _to_domain(row)
