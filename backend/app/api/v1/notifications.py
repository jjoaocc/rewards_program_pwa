from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app.api.deps import get_db, get_current_customer
from app.models import Customer, Notification
from app.schemas import NotificationResponse, NotificationMarkRead

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_my_notifications(
    unread_only: bool = False,
    limit: int = 50,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Lista notificações do cliente autenticado.
    Ordenadas por data (mais recentes primeiro).
    """
    
    query = db.query(Notification).filter(
        Notification.customer_id == current_customer.id
    )
    
    if unread_only:
        query = query.filter(Notification.read == False)
    
    notifications = query.order_by(desc(Notification.created_at)).limit(limit).all()
    
    return notifications

@router.patch("/mark-read")
def mark_notifications_as_read(
    data: NotificationMarkRead,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Marca notificações como lidas.
    """
    
    # Buscar notificações do cliente
    notifications = db.query(Notification).filter(
        Notification.id.in_(data.notification_ids),
        Notification.customer_id == current_customer.id
    ).all()
    
    if not notifications:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificações não encontradas"
        )
    
    # Marcar como lidas
    for notification in notifications:
        notification.read = True
    
    db.commit()
    
    return {
        "message": f"{len(notifications)} notificação(ões) marcada(s) como lida(s)",
        "updated_count": len(notifications)
    }

@router.patch("/mark-all-read")
def mark_all_notifications_as_read(
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Marca TODAS as notificações do cliente como lidas.
    """
    
    updated = db.query(Notification).filter(
        Notification.customer_id == current_customer.id,
        Notification.read == False
    ).update({"read": True})
    
    db.commit()
    
    return {
        "message": f"{updated} notificação(ões) marcada(s) como lida(s)",
        "updated_count": updated
    }