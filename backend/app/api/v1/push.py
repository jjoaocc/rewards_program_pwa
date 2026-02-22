import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.api.deps import get_db, get_current_customer
from app.core.config import settings
from app.core.push import send_push_to_customer
from app.models import Customer, PushSubscription
from app.schemas.push import (
    PushSubscribeRequest,
    PushSendRequest,
    PushBroadcastRequest,
    PushPublicKeyResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/push", tags=["push"])


def _verify_admin(x_admin_secret: Optional[str] = Header(None)) -> None:
    if x_admin_secret != settings.PUSH_ADMIN_SECRET:
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
    db: Session = Depends(get_db),
):
    """Registra ou atualiza a PushSubscription do dispositivo."""
    existing = db.query(PushSubscription).filter(PushSubscription.endpoint == data.endpoint).first()

    if existing:
        existing.p256dh = data.p256dh
        existing.auth = data.auth
        db.commit()
        return {"message": "Subscription atualizada", "id": str(existing.id)}

    sub = PushSubscription(
        customer_id=current_customer.id,
        endpoint=data.endpoint,
        p256dh=data.p256dh,
        auth=data.auth,
        user_agent=data.user_agent,
    )
    try:
        db.add(sub)
        db.commit()
        db.refresh(sub)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Subscription já registrada")

    return {"message": "Subscription registrada", "id": str(sub.id)}


@router.delete("/unsubscribe")
def unsubscribe(
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """Remove todas as subscriptions do cliente autenticado."""
    deleted = db.query(PushSubscription).filter(
        PushSubscription.customer_id == current_customer.id
    ).delete()
    db.commit()
    return {"message": f"{deleted} subscription(s) removida(s)"}


# ── Endpoints admin (requerem X-Admin-Secret no header) ────────────────────

@router.post("/send", dependencies=[Depends(_verify_admin)])
def send_push_manual(data: PushSendRequest, db: Session = Depends(get_db)):
    """Envia push para um cliente específico. Uso: testes e comunicação pontual."""
    result = send_push_to_customer(
        customer_id=data.customer_id,
        title=data.title,
        message=data.message,
        url=data.url,
        db=db,
    )
    return {"message": "Push enviado", **result}


@router.post("/broadcast", dependencies=[Depends(_verify_admin)])
def broadcast(data: PushBroadcastRequest, db: Session = Depends(get_db)):
    """Envia push para todos os clientes com subscription ativa."""
    customer_ids = list({
        sub.customer_id
        for sub in db.query(PushSubscription.customer_id).all()
    })

    total = {"sent": 0, "failed": 0, "removed": 0}
    for cid in customer_ids:
        r = send_push_to_customer(cid, data.title, data.message, data.url, db)
        total["sent"] += r["sent"]
        total["failed"] += r["failed"]
        total["removed"] += r["removed"]

    return {"customers_targeted": len(customer_ids), **total}