from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from typing import List
from datetime import date

from app.api.deps import get_db
from app.models import Event
from app.schemas import EventResponse

router = APIRouter(prefix="/events", tags=["events"])

@router.get("", response_model=List[EventResponse])
def get_events(
    active_only: bool = Query(True, description="Apenas eventos ativos"),
    current_only: bool = Query(False, description="Apenas eventos vigentes hoje"),
    db: Session = Depends(get_db)
):
    """
    Lista eventos e promoções.
    Não requer autenticação (público).
    """
    
    query = db.query(Event)
    
    if active_only:
        query = query.filter(Event.active == True)
    
    if current_only:
        today = date.today()
        query = query.filter(
            and_(
                Event.start_date <= today,
                Event.end_date >= today
            )
        )
    
    # Ordenar por data de início (mais recentes primeiro)
    events = query.order_by(desc(Event.start_date)).all()
    
    return events