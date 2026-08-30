from datetime import date

from sqlalchemy import and_, desc
from sqlalchemy.orm import Session

from app.models import Event


def list_events(db: Session, *, active_only: bool = True, current_only: bool = False) -> list[Event]:
    query = db.query(Event)

    if active_only:
        query = query.filter(Event.active.is_(True))

    if current_only:
        today = date.today()
        query = query.filter(and_(Event.start_date <= today, Event.end_date >= today))

    return query.order_by(desc(Event.start_date)).all()
