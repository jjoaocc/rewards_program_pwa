from sqlalchemy.orm import Session

from app.core.push import WebPushSender, _pywebpush_sender, send_push_to_customer, send_push_to_subscriptions
from app.domain.customer import Customer
from app.domain.push import PushCampaign, PushSubscription
from app.models import Notification as NotificationModel
from app.models import PushCampaign as PushCampaignModel
from app.models import PushSubscription as PushSubscriptionModel
from app.ports.customer_repository import CustomerRepository
from app.ports.notification_repository import NotificationRepository
from app.ports.push_campaign_repository import PushCampaignRepository
from app.ports.push_subscription_repository import PushSubscriptionRepository


def subscribe(
    repo: PushSubscriptionRepository, customer_id: str, endpoint: str, p256dh: str, auth: str, user_agent: str | None
) -> tuple[PushSubscription, bool]:
    return repo.subscribe(customer_id, endpoint, p256dh, auth, user_agent)


def unsubscribe(repo: PushSubscriptionRepository, customer_id: str) -> int:
    return repo.unsubscribe(customer_id)


def search_customers(repo: CustomerRepository, search: str, limit: int = 20) -> list[Customer]:
    return repo.search(search, limit)


def list_campaigns(repo: PushCampaignRepository, limit: int = 20) -> list[PushCampaign]:
    return repo.list_recent(limit)


def _build_notifications(customer_ids: list[str], title: str, message: str, *, url: str) -> list[NotificationModel]:
    """Monta (sem persistir) uma notificação idêntica pra vários clientes, deixa o
    caller decidir quando commitar, pra poder agrupar com outros objetos num único
    commit (ex: o registro de campanha do push admin). Fica em ORM direto (não em
    NotificationRepository) porque essa otimização de batching é um detalhe de infra
    do Push, não uma operação de dominio de Notification."""
    return [
        NotificationModel(customer_id=customer_id, title=title, message=message, type="system", action_url=url)
        for customer_id in customer_ids
    ]


def send_to_customer(
    db: Session,
    customer_id: str,
    title: str,
    message: str,
    url: str,
    notification_repo: NotificationRepository,
    campaign_repo: PushCampaignRepository,
    sender: WebPushSender = _pywebpush_sender,
) -> dict:
    notification_repo.create(customer_id, title, message, action_url=url)

    campaign = campaign_repo.create(
        title, message, url, target_type="individual", target_customer_ids=customer_id, customers_targeted=1
    )

    result = send_push_to_customer(customer_id, title, message, url, db, sender)
    campaign_repo.record_result(campaign.id, result["sent"], result["failed"], result["removed"])
    return result


def send_to_customers(
    db: Session,
    customer_ids: list[str],
    title: str,
    message: str,
    url: str,
    customer_repo: CustomerRepository,
    campaign_repo: PushCampaignRepository,
    sender: WebPushSender = _pywebpush_sender,
) -> dict:
    """Envia push e registra notificação in-app pra uma lista específica de clientes
    (não todos, não só um), ex: um segmento escolhido no painel admin."""
    existing_ids = customer_repo.filter_existing_ids(customer_ids)
    not_found = [cid for cid in customer_ids if cid not in existing_ids]

    notifications = _build_notifications(existing_ids, title, message, url=url)
    campaign_row = PushCampaignModel(
        title=title,
        message=message,
        url=url,
        target_type="selected",
        target_customer_ids=",".join(existing_ids),
        customers_targeted=len(existing_ids),
    )
    # Notificações + campanha entram no mesmo commit (não campaign_repo.create(), que
    # commitaria sozinho) -- preserva o "1 commit pro lote inteiro", não 1 por cliente.
    db.add_all(notifications)
    db.add(campaign_row)
    db.commit()

    subs = (
        db.query(PushSubscriptionModel).filter(PushSubscriptionModel.customer_id.in_(existing_ids)).all()
    )
    result = send_push_to_subscriptions(subs, title, message, url, db, sender)
    campaign_repo.record_result(campaign_row.id, result["sent"], result["failed"], result["removed"])

    return {"customers_targeted": len(existing_ids), "not_found": not_found, **result}


def broadcast(
    db: Session,
    title: str,
    message: str,
    url: str,
    campaign_repo: PushCampaignRepository,
    sender: WebPushSender = _pywebpush_sender,
) -> dict:
    """Envia push e registra notificação in-app para todo cliente com subscription ativa.

    Uma única query carrega todas as subscriptions (em vez de uma por cliente), e as
    notificações são criadas num único bulk insert + commit junto com o registro da
    campanha, não um commit por cliente.
    """
    subs = db.query(PushSubscriptionModel).all()
    customer_ids = list({sub.customer_id for sub in subs})

    notifications = _build_notifications(customer_ids, title, message, url=url)
    campaign_row = PushCampaignModel(
        title=title,
        message=message,
        url=url,
        target_type="broadcast",
        target_customer_ids=None,
        customers_targeted=len(customer_ids),
    )
    db.add_all(notifications)
    db.add(campaign_row)
    db.commit()

    result = send_push_to_subscriptions(subs, title, message, url, db, sender)
    campaign_repo.record_result(campaign_row.id, result["sent"], result["failed"], result["removed"])

    return {"customers_targeted": len(customer_ids), **result}
