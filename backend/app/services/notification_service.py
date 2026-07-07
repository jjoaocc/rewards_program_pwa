from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.pagination import MAX_PAGE_SIZE
from app.models import Notification


def list_notifications(
    db: Session, customer_id: str, *, unread_only: bool = False, limit: int = 50
) -> list[Notification]:
    query = db.query(Notification).filter(Notification.customer_id == customer_id)

    if unread_only:
        query = query.filter(~Notification.read)

    capped_limit = min(limit, MAX_PAGE_SIZE)
    return query.order_by(desc(Notification.created_at)).limit(capped_limit).all()


def mark_as_read(db: Session, customer_id: str, notification_ids: list[str]) -> list[Notification]:
    notifications = (
        db.query(Notification)
        .filter(Notification.id.in_(notification_ids), Notification.customer_id == customer_id)
        .all()
    )

    for notification in notifications:
        notification.read = True

    db.commit()
    return notifications


def delete_notification(db: Session, customer_id: str, notification_id: str) -> bool:
    """Remove uma notificação do cliente. Retorna False se não existir ou pertencer
    a outro cliente — o filtro por customer_id garante que não dá pra apagar
    notificação de outra pessoa só sabendo o ID."""
    deleted = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.customer_id == customer_id)
        .delete()
    )
    db.commit()
    return bool(deleted)


def mark_all_as_read(db: Session, customer_id: str) -> int:
    updated = (
        db.query(Notification)
        .filter(Notification.customer_id == customer_id, ~Notification.read)
        .update({"read": True})
    )
    db.commit()
    return updated


def create_notification(
    db: Session,
    customer_id: str,
    title: str,
    message: str,
    *,
    type: str = "system",
    action_url: str | None = None,
) -> Notification:
    notification = Notification(
        customer_id=customer_id,
        title=title,
        message=message,
        type=type,
        action_url=action_url,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def build_notifications(
    customer_ids: list[str],
    title: str,
    message: str,
    *,
    type: str = "system",
    action_url: str | None = None,
) -> list[Notification]:
    """Monta (sem persistir) uma notificação idêntica pra vários clientes — deixa o
    caller decidir quando commitar, pra poder agrupar com outros objetos num único
    commit (ex: o registro de campanha do push admin)."""
    return [
        Notification(customer_id=customer_id, title=title, message=message, type=type, action_url=action_url)
        for customer_id in customer_ids
    ]
