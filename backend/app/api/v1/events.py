from fastapi import APIRouter, Depends, Query

from app.api.deps import get_event_repository
from app.application import event_use_cases
from app.domain.event import EventFilters
from app.ports.event_repository import EventRepository
from app.schemas import EventResponse

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventResponse])
def get_events(
    active_only: bool = Query(True, description="Apenas eventos ativos"),
    current_only: bool = Query(False, description="Apenas eventos vigentes hoje"),
    repo: EventRepository = Depends(get_event_repository),
):
    """
    Lista eventos e promoções.
    Não requer autenticação (público).
    """
    filters = EventFilters(active_only=active_only, current_only=current_only)
    return event_use_cases.list_events(repo, filters)
