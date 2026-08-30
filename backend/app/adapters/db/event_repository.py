from datetime import date

from sqlalchemy import and_, desc
from sqlalchemy.orm import Session

from app.adapters.db.mapping import row_to_domain
from app.domain.event import Event, EventFilters
from app.models import Event as EventModel


def _to_domain(row: EventModel) -> Event:
    return row_to_domain(Event, row)


class SqlAlchemyEventRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def list(self, filters: EventFilters) -> list[Event]:
        query = self._db.query(EventModel)

        if filters.active_only:
            query = query.filter(EventModel.active.is_(True))

        if filters.current_only:
            today = date.today()
            query = query.filter(and_(EventModel.start_date <= today, EventModel.end_date >= today))

        rows = query.order_by(desc(EventModel.start_date)).all()
        return [_to_domain(row) for row in rows]
