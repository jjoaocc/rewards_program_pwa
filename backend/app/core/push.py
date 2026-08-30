import json
import logging
import uuid
from typing import Protocol

from pywebpush import WebPushException, webpush

from app.core.config import settings
from app.domain.push import PushSubscription

logger = logging.getLogger(__name__)


class WebPushSender(Protocol):
    """Porta para o envio de um push individual — permite injetar um fake nos testes
    sem precisar fazer monkeypatch direto na função `webpush` da lib `pywebpush`."""

    def __call__(self, *, subscription_info: dict, data: str, vapid_private_key: str, vapid_claims: dict) -> None: ...


def _pywebpush_sender(*, subscription_info: dict, data: str, vapid_private_key: str, vapid_claims: dict) -> None:
    webpush(
        subscription_info=subscription_info,
        data=data,
        vapid_private_key=vapid_private_key,
        vapid_claims=vapid_claims,
    )


def _subscription_info(sub: PushSubscription) -> dict:
    return {
        "endpoint": sub.endpoint,
        "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
    }


def _send_one(sub: PushSubscription, title: str, message: str, url: str, sender: WebPushSender) -> bool | None:
    payload = json.dumps(
        {
            "title": title,
            "body": message,
            "icon": "/pwa-192x192.png",
            "badge": "/pwa-192x192.png",
            "data": {"url": url},
        }
    )
    try:
        sender(
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
    except Exception as e:
        # Falha de rede (timeout, DNS, conexão recusada) não é um WebPushException —
        # não pode derrubar a requisição inteira; conta como falha e segue para a próxima.
        logger.warning("Push falhou para sub %s — erro de rede: %s", sub.id, e)
        return False


def send_push_to_subscriptions(
    subs: list[PushSubscription],
    title: str,
    message: str,
    url: str,
    sender: WebPushSender = _pywebpush_sender,
) -> dict:
    """Envia o mesmo push pra uma lista de subscriptions já carregada (usado tanto
    pra um único cliente quanto pro broadcast, sem re-consultar o banco por cliente).

    Não mexe em banco — devolve `removed_ids` (subscriptions expiradas/revogadas,
    HTTP 410) pra quem chamou decidir como/quando remover via
    PushSubscriptionRepository.remove_many(), mantendo esta função livre de
    infraestrutura de persistência (é só o adapter do envio via WebPushSender)."""
    sent = failed = 0
    removed_ids: list[uuid.UUID] = []
    for sub in subs:
        result = _send_one(sub, title, message, url, sender)
        if result is True:
            sent += 1
        elif result is None:
            removed_ids.append(sub.id)
        else:
            failed += 1

    return {"sent": sent, "failed": failed, "removed": len(removed_ids), "removed_ids": removed_ids}
