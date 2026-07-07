from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas import EventResponse
from app.services import event_service

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventResponse])
def get_events(
    active_only: bool = Query(True, description="Apenas eventos ativos"),
    current_only: bool = Query(False, description="Apenas eventos vigentes hoje"),
    db: Session = Depends(get_db),
):
    """
    Lista eventos e promoções.
    Não requer autenticação (público).
    """
    return event_service.list_events(db, active_only=active_only, current_only=current_only)
