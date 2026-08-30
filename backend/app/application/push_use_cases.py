import uuid

from app.core.push import WebPushSender, _pywebpush_sender, send_push_to_subscriptions
from app.domain.customer import Customer
from app.domain.push import PushCampaign, PushSubscription
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


def _send_and_record(
    subs: list[PushSubscription],
    title: str,
    message: str,
    url: str,
    campaign_id: uuid.UUID,
    subscription_repo: PushSubscriptionRepository,
    campaign_repo: PushCampaignRepository,
    sender: WebPushSender,
) -> dict:
    result = send_push_to_subscriptions(subs, title, message, url, sender)
    if result["removed_ids"]:
        subscription_repo.remove_many(result["removed_ids"])
    campaign_repo.record_result(campaign_id, result["sent"], result["failed"], result["removed"])
    return {"sent": result["sent"], "failed": result["failed"], "removed": result["removed"]}


def send_to_customer(
    customer_id: str,
    title: str,
    message: str,
    url: str,
    subscription_repo: PushSubscriptionRepository,
    notification_repo: NotificationRepository,
    campaign_repo: PushCampaignRepository,
    sender: WebPushSender = _pywebpush_sender,
) -> dict:
    notification_repo.create(customer_id, title, message, action_url=url)
    campaign = campaign_repo.create(
        title, message, url, target_type="individual", target_customer_ids=customer_id, customers_targeted=1
    )
    subs = subscription_repo.list_for_customer(customer_id)
    return _send_and_record(subs, title, message, url, campaign.id, subscription_repo, campaign_repo, sender)


def send_to_customers(
    customer_ids: list[str],
    title: str,
    message: str,
    url: str,
    customer_repo: CustomerRepository,
    subscription_repo: PushSubscriptionRepository,
    campaign_repo: PushCampaignRepository,
    sender: WebPushSender = _pywebpush_sender,
) -> dict:
    """Envia push e registra notificação in-app pra uma lista específica de clientes
    (não todos, não só um), ex: um segmento escolhido no painel admin."""
    existing_ids = customer_repo.filter_existing_ids(customer_ids)
    not_found = [cid for cid in customer_ids if cid not in existing_ids]

    campaign = campaign_repo.create_and_notify(
        title,
        message,
        url,
        target_type="selected",
        target_customer_ids=",".join(existing_ids),
        customer_ids_to_notify=existing_ids,
    )

    subs = subscription_repo.list_for_customers(existing_ids)
    result = _send_and_record(subs, title, message, url, campaign.id, subscription_repo, campaign_repo, sender)

    return {"customers_targeted": len(existing_ids), "not_found": not_found, **result}


def broadcast(
    title: str,
    message: str,
    url: str,
    subscription_repo: PushSubscriptionRepository,
    campaign_repo: PushCampaignRepository,
    sender: WebPushSender = _pywebpush_sender,
) -> dict:
    """Envia push e registra notificação in-app para todo cliente com subscription ativa.

    Uma única query carrega todas as subscriptions (em vez de uma por cliente), e as
    notificações são criadas num único bulk insert + commit junto com o registro da
    campanha, não um commit por cliente.
    """
    subs = subscription_repo.list_all()
    customer_ids = list({sub.customer_id for sub in subs})

    campaign = campaign_repo.create_and_notify(
        title, message, url, target_type="broadcast", target_customer_ids=None, customer_ids_to_notify=customer_ids
    )

    result = _send_and_record(subs, title, message, url, campaign.id, subscription_repo, campaign_repo, sender)

    return {"customers_targeted": len(customer_ids), **result}
