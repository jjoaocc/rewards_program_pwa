import json
import logging
from sqlalchemy.orm import Session
from pywebpush import webpush, WebPushException

from app.core.config import settings
from app.models.push_subscription import PushSubscription
from app.models.notification import Notification

logger = logging.getLogger(__name__)


def _subscription_info(sub: PushSubscription) -> dict:
    return {
        "endpoint": sub.endpoint,
        "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
    }


def _send_one(sub: PushSubscription, title: str, message: str, url: str) -> bool:
    payload = json.dumps({
        "title": title,
        "body": message,
        "icon": "/pwa-192x192.png",
        "badge": "/pwa-192x192.png",
        "data": {"url": url},
    })
    try:
        webpush(
            subscription_info=_subscription_info(sub),
            data=payload,
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": f"mailto:{settings.VAPID_ADMIN_EMAIL}"},
        )
        return True
    except WebPushException as e:
        status_code = e.response.status_code if e.response is not None else None
        logger.warning("Push falhou para sub %s — HTTP %s", sub.id, status_code)
        # 410 = subscription expirada/revogada pelo usuário
        if status_code == 410:
            return None  # sinaliza para remover do banco
        return False


def send_push_to_customer(customer_id: str, title: str, message: str, url: str, db: Session) -> dict:
    subs = db.query(PushSubscription).filter(PushSubscription.customer_id == customer_id).all()

    sent = failed = removed = 0
    for sub in subs:
        result = _send_one(sub, title, message, url)
        if result is True:
            sent += 1
        elif result is None:
            db.delete(sub)
            removed += 1
        else:
            failed += 1

    if removed:
        db.commit()

    return {"sent": sent, "failed": failed, "removed": removed}


def notify_customer(notification: Notification, db: Session) -> None:
    """Chamado automaticamente ao criar uma Notification no banco."""
    try:
        send_push_to_customer(
            customer_id=notification.customer_id,
            title=notification.title,
            message=notification.message,
            url=notification.action_url or "/",
            db=db,
        )
    except Exception as e:
        logger.error("Erro inesperado no notify_customer: %s", str(e))