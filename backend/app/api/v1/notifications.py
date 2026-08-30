from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_customer, get_notification_repository
from app.application import notification_use_cases
from app.domain.customer import Customer
from app.ports.notification_repository import NotificationRepository
from app.schemas import NotificationMarkRead, NotificationResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
def get_my_notifications(
    unread_only: bool = False,
    # Sem teto aqui de propósito: um limit alto continua sendo aceito e o repository
    # que silenciosamente cappeia em MAX_PAGE_SIZE (comportamento já coberto por
    # test_notifications_client_cannot_request_more_than_the_cap). Só o piso precisa
    # de validação — negativo não faz sentido e travava o SQL com LIMIT inválido.
    limit: int = Query(50, ge=1),
    current_customer: Customer = Depends(get_current_customer),
    repo: NotificationRepository = Depends(get_notification_repository),
):
    """
    Lista notificações do cliente autenticado.
    Ordenadas por data (mais recentes primeiro).
    """
    return notification_use_cases.list_notifications(repo, current_customer.id, unread_only=unread_only, limit=limit)


@router.patch("/mark-read")
def mark_notifications_as_read(
    data: NotificationMarkRead,
    current_customer: Customer = Depends(get_current_customer),
    repo: NotificationRepository = Depends(get_notification_repository),
):
    """
    Marca notificações como lidas.
    """
    notifications = notification_use_cases.mark_as_read(repo, current_customer.id, data.notification_ids)

    if not notifications:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notificações não encontradas")

    return {
        "message": f"{len(notifications)} notificação(ões) marcada(s) como lida(s)",
        "updated_count": len(notifications),
    }


@router.patch("/mark-all-read")
def mark_all_notifications_as_read(
    current_customer: Customer = Depends(get_current_customer),
    repo: NotificationRepository = Depends(get_notification_repository),
):
    """
    Marca TODAS as notificações do cliente como lidas.
    """
    updated = notification_use_cases.mark_all_as_read(repo, current_customer.id)

    return {"message": f"{updated} notificação(ões) marcada(s) como lida(s)", "updated_count": updated}


@router.delete("/{notification_id}")
def delete_my_notification(
    notification_id: str,
    current_customer: Customer = Depends(get_current_customer),
    repo: NotificationRepository = Depends(get_notification_repository),
):
    """
    Remove uma notificação do cliente autenticado.
    """
    deleted = notification_use_cases.delete_notification(repo, current_customer.id, notification_id)

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notificação não encontrada")

    return {"message": "Notificação removida"}
