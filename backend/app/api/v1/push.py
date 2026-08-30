import secrets

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status

from app.api.deps import (
    get_current_customer,
    get_customer_repository,
    get_notification_repository,
    get_push_campaign_repository,
    get_push_subscription_repository,
)
from app.application import push_use_cases
from app.core.config import Settings, get_settings, settings
from app.core.limiter import limiter
from app.core.security import create_admin_token, decode_admin_token
from app.domain.customer import Customer
from app.domain.push import SubscriptionConflictError
from app.ports.customer_repository import CustomerRepository
from app.ports.notification_repository import NotificationRepository
from app.ports.push_campaign_repository import PushCampaignRepository
from app.ports.push_subscription_repository import PushSubscriptionRepository
from app.schemas.push import (
    AdminLoginRequest,
    AdminLoginResponse,
    CustomerSearchResult,
    PushBroadcastRequest,
    PushBulkSendRequest,
    PushCampaignResponse,
    PushPublicKeyResponse,
    PushSendRequest,
    PushSubscribeRequest,
)

router = APIRouter(prefix="/push", tags=["push"])


def _verify_admin(
    authorization: str | None = Header(None),
    x_admin_secret: str | None = Header(None),
    current_settings: Settings = Depends(get_settings),
) -> None:
    """Aceita duas formas de autenticação admin: um Bearer token de sessão (obtido em
    /push/admin/login, o caminho recomendado pro painel — não guarda o secret
    permanente no navegador) ou o header X-Admin-Secret direto (mantido pra scripts/
    chamadas simples e para não quebrar integrações existentes)."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
        if decode_admin_token(token):
            return
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")

    if x_admin_secret and secrets.compare_digest(x_admin_secret, current_settings.PUSH_ADMIN_SECRET):
        return

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")


# ── Endpoints do cliente (requerem JWT) ────────────────────────────────────


@router.get("/vapid-public-key", response_model=PushPublicKeyResponse)
def get_vapid_public_key():
    """Retorna a chave pública VAPID para o frontend criar a subscription."""
    return {"public_key": settings.VAPID_PUBLIC_KEY}


@router.post("/subscribe", status_code=status.HTTP_201_CREATED)
def subscribe(
    data: PushSubscribeRequest,
    current_customer: Customer = Depends(get_current_customer),
    repo: PushSubscriptionRepository = Depends(get_push_subscription_repository),
):
    """Registra ou atualiza a PushSubscription do dispositivo."""
    try:
        sub, created = push_use_cases.subscribe(
            repo, current_customer.id, data.endpoint, data.p256dh, data.auth, data.user_agent
        )
    except SubscriptionConflictError as e:
        raise HTTPException(status_code=400, detail="Subscription já registrada") from e

    message = "Subscription registrada" if created else "Subscription atualizada"
    return {"message": message, "id": str(sub.id)}


@router.delete("/unsubscribe")
def unsubscribe(
    current_customer: Customer = Depends(get_current_customer),
    repo: PushSubscriptionRepository = Depends(get_push_subscription_repository),
):
    """Remove todas as subscriptions do cliente autenticado."""
    deleted = push_use_cases.unsubscribe(repo, current_customer.id)
    return {"message": f"{deleted} subscription(s) removida(s)"}


# ── Login do painel admin ───────────────────────────────────────────────────


@router.post("/admin/login", response_model=AdminLoginResponse)
@limiter.limit("5/minute")
def admin_login(request: Request, data: AdminLoginRequest, current_settings: Settings = Depends(get_settings)):
    """Troca o PUSH_ADMIN_SECRET por um token de sessão de curta duração — o painel
    guarda esse token no navegador, não o secret permanente."""
    if not secrets.compare_digest(data.secret, current_settings.PUSH_ADMIN_SECRET):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")
    return {"token": create_admin_token()}


# ── Endpoints admin (requerem Bearer token ou X-Admin-Secret) ──────────────


@router.get("/admin/customers", response_model=list[CustomerSearchResult], dependencies=[Depends(_verify_admin)])
def admin_search_customers(
    search: str = "",
    repo: CustomerRepository = Depends(get_customer_repository),
):
    """Busca clientes por nome/email/ID pro painel admin escolher destinatários."""
    return push_use_cases.search_customers(repo, search)


@router.get("/admin/campaigns", response_model=list[PushCampaignResponse], dependencies=[Depends(_verify_admin)])
def admin_list_campaigns(
    limit: int = 20,
    repo: PushCampaignRepository = Depends(get_push_campaign_repository),
):
    """Histórico de envios feitos pelo painel admin (individual, seleção ou broadcast)."""
    return push_use_cases.list_campaigns(repo, limit)


@router.post("/send", dependencies=[Depends(_verify_admin)])
@limiter.limit("10/minute")
def send_push_manual(
    request: Request,
    data: PushSendRequest,
    customer_repo: CustomerRepository = Depends(get_customer_repository),
    subscription_repo: PushSubscriptionRepository = Depends(get_push_subscription_repository),
    notification_repo: NotificationRepository = Depends(get_notification_repository),
    campaign_repo: PushCampaignRepository = Depends(get_push_campaign_repository),
):
    """Envia push para um cliente específico e registra a notificação in-app."""
    customer = customer_repo.get_by_id(data.customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")

    result = push_use_cases.send_to_customer(
        customer.id, data.title, data.message, data.url, subscription_repo, notification_repo, campaign_repo
    )
    return {"message": "Push enviado", **result}


@router.post("/send-bulk", dependencies=[Depends(_verify_admin)])
@limiter.limit("10/minute")
def send_push_bulk(
    request: Request,
    data: PushBulkSendRequest,
    customer_repo: CustomerRepository = Depends(get_customer_repository),
    subscription_repo: PushSubscriptionRepository = Depends(get_push_subscription_repository),
    campaign_repo: PushCampaignRepository = Depends(get_push_campaign_repository),
):
    """Envia push e registra notificação in-app pra uma lista específica de clientes."""
    return push_use_cases.send_to_customers(
        data.customer_ids, data.title, data.message, data.url, customer_repo, subscription_repo, campaign_repo
    )


@router.post("/broadcast", dependencies=[Depends(_verify_admin)])
@limiter.limit("10/minute")
def broadcast(
    request: Request,
    data: PushBroadcastRequest,
    subscription_repo: PushSubscriptionRepository = Depends(get_push_subscription_repository),
    campaign_repo: PushCampaignRepository = Depends(get_push_campaign_repository),
):
    """Envia push e registra notificação in-app para todos os clientes com subscription ativa."""
    return push_use_cases.broadcast(data.title, data.message, data.url, subscription_repo, campaign_repo)
