from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.adapters.db.notification_repository import SqlAlchemyNotificationRepository
from app.core.push import WebPushSender, _pywebpush_sender, send_push_to_subscriptions
from app.models import Customer, Notification, PushCampaign, PushSubscription


class SubscriptionConflictError(Exception):
    """Mesma subscription registrada em paralelo por outra requisição concorrente."""


def _build_notifications(customer_ids: list[str], title: str, message: str, *, url: str) -> list[Notification]:
    """Monta (sem persistir) uma notificação idêntica pra vários clientes, deixa o
    caller decidir quando commitar, pra poder agrupar com outros objetos num único
    commit (ex: o registro de campanha do push admin)."""
    return [
        Notification(customer_id=customer_id, title=title, message=message, type="system", action_url=url)
        for customer_id in customer_ids
    ]


def subscribe(
    db: Session,
    customer_id: str,
    endpoint: str,
    p256dh: str,
    auth: str,
    user_agent: str | None,
) -> tuple[PushSubscription, bool]:
    """Registra ou reatribui a PushSubscription do dispositivo. Retorna (subscription, created).

    O endpoint é único por navegador/dispositivo, não por cliente — se outro cliente
    reusar o mesmo endpoint (ex: mesmo navegador, login trocado sem unsubscribe), quem
    assina por último passa a ser o dono, evitando que um push endereçado ao dono antigo
    vaze pro dispositivo de outra pessoa.
    """
    existing = db.query(PushSubscription).filter(PushSubscription.endpoint == endpoint).first()

    if existing:
        existing.customer_id = customer_id
        existing.p256dh = p256dh
        existing.auth = auth
        db.commit()
        return existing, False

    sub = PushSubscription(
        customer_id=customer_id,
        endpoint=endpoint,
        p256dh=p256dh,
        auth=auth,
        user_agent=user_agent,
    )
    try:
        db.add(sub)
        db.commit()
        db.refresh(sub)
    except IntegrityError as e:
        db.rollback()
        raise SubscriptionConflictError() from e

    return sub, True


def unsubscribe(db: Session, customer_id: str) -> int:
    deleted = db.query(PushSubscription).filter(PushSubscription.customer_id == customer_id).delete()
    db.commit()
    return deleted


def _record_campaign_result(db: Session, campaign: PushCampaign, result: dict) -> None:
    campaign.sent = result["sent"]
    campaign.failed = result["failed"]
    campaign.removed = result["removed"]
    db.commit()


def send_to_customer(
    db: Session,
    customer_id: str,
    title: str,
    message: str,
    url: str,
    sender: WebPushSender = _pywebpush_sender,
) -> dict:
    SqlAlchemyNotificationRepository(db).create(customer_id, title, message, action_url=url)

    campaign = PushCampaign(
        title=title,
        message=message,
        url=url,
        target_type="individual",
        target_customer_ids=customer_id,
        customers_targeted=1,
    )
    db.add(campaign)
    db.commit()

    subs = db.query(PushSubscription).filter(PushSubscription.customer_id == customer_id).all()
    result = send_push_to_subscriptions(subs, title, message, url, db, sender)
    _record_campaign_result(db, campaign, result)
    return result


def send_to_customers(
    db: Session,
    customer_ids: list[str],
    title: str,
    message: str,
    url: str,
    sender: WebPushSender = _pywebpush_sender,
) -> dict:
    """Envia push e registra notificação in-app pra uma lista específica de clientes
    (não todos, não só um) — ex: um segmento escolhido no painel admin."""
    existing_ids = [c.id for c in db.query(Customer.id).filter(Customer.id.in_(customer_ids)).all()]
    not_found = [cid for cid in customer_ids if cid not in existing_ids]

    notifications = _build_notifications(existing_ids, title, message, url=url)
    campaign = PushCampaign(
        title=title,
        message=message,
        url=url,
        target_type="selected",
        target_customer_ids=",".join(existing_ids),
        customers_targeted=len(existing_ids),
    )
    db.add_all(notifications)
    db.add(campaign)
    db.commit()

    subs = db.query(PushSubscription).filter(PushSubscription.customer_id.in_(existing_ids)).all()
    result = send_push_to_subscriptions(subs, title, message, url, db, sender)
    _record_campaign_result(db, campaign, result)

    return {"customers_targeted": len(existing_ids), "not_found": not_found, **result}


def broadcast(
    db: Session,
    title: str,
    message: str,
    url: str,
    sender: WebPushSender = _pywebpush_sender,
) -> dict:
    """Envia push e registra notificação in-app pra todo cliente com subscription ativa.

    Uma única query carrega todas as subscriptions (em vez de uma por cliente), e as
    notificações são criadas num único bulk insert + commit junto com o registro da
    campanha, não um commit por cliente.
    """
    subs = db.query(PushSubscription).all()
    customer_ids = list({sub.customer_id for sub in subs})

    notifications = _build_notifications(customer_ids, title, message, url=url)
    campaign = PushCampaign(
        title=title,
        message=message,
        url=url,
        target_type="broadcast",
        target_customer_ids=None,
        customers_targeted=len(customer_ids),
    )
    db.add_all(notifications)
    db.add(campaign)
    db.commit()

    result = send_push_to_subscriptions(subs, title, message, url, db, sender)
    _record_campaign_result(db, campaign, result)

    return {"customers_targeted": len(customer_ids), **result}


def search_customers(db: Session, search: str = "", limit: int = 20) -> list[Customer]:
    """Busca clientes por nome, email ou ID pra alimentar a seleção de destinatários
    no painel admin. Sem termo de busca, lista os primeiros por nome."""
    query = db.query(Customer)
    if search:
        pattern = f"%{search}%"
        query = query.filter(Customer.name.ilike(pattern) | Customer.email.ilike(pattern) | Customer.id.ilike(pattern))
    return query.order_by(Customer.name).limit(limit).all()


def list_campaigns(db: Session, limit: int = 20) -> list[PushCampaign]:
    return db.query(PushCampaign).order_by(desc(PushCampaign.created_at)).limit(limit).all()
