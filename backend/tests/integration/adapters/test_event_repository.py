from datetime import date, timedelta
from decimal import Decimal

from app.adapters.db.event_repository import SqlAlchemyEventRepository
from app.domain.event import EventFilters
from app.models import Event as EventModel


def _make_event(db_session, **overrides):
    today = date.today()
    defaults = {
        "title": "Evento",
        "description": "Descrição",
        "discount": Decimal("10.00"),
        "start_date": today - timedelta(days=1),
        "end_date": today + timedelta(days=30),
        "active": True,
    }
    defaults.update(overrides)
    event = EventModel(**defaults)
    db_session.add(event)
    db_session.commit()
    return event


def test_list_excludes_inactive_by_default_against_real_postgres(db_session):
    _make_event(db_session, title="Ativo", active=True)
    _make_event(db_session, title="Inativo", active=False)
    repo = SqlAlchemyEventRepository(db_session)

    result = repo.list(EventFilters())

    assert [e.title for e in result] == ["Ativo"]


def test_list_current_only_excludes_expired(db_session):
    today = date.today()
    _make_event(
        db_session, title="Vigente", start_date=today - timedelta(days=1), end_date=today + timedelta(days=1)
    )
    _make_event(
        db_session, title="Expirado", start_date=today - timedelta(days=30), end_date=today - timedelta(days=10)
    )
    repo = SqlAlchemyEventRepository(db_session)

    result = repo.list(EventFilters(current_only=True))

    assert [e.title for e in result] == ["Vigente"]


def test_list_orders_by_start_date_descending(db_session):
    today = date.today()
    _make_event(db_session, title="Antigo", start_date=today - timedelta(days=10), active=False)
    _make_event(db_session, title="Recente", start_date=today - timedelta(days=1), active=False)
    repo = SqlAlchemyEventRepository(db_session)

    result = repo.list(EventFilters(active_only=False))

    assert [e.title for e in result] == ["Recente", "Antigo"]
