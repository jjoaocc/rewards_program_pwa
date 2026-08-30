import uuid
from datetime import date, datetime, timedelta
from decimal import Decimal

from app.application.event_use_cases import list_events
from app.domain.event import Event, EventFilters
from tests.fakes.fake_event_repository import FakeEventRepository


def _make_event(**overrides) -> Event:
    today = date.today()
    defaults = {
        "id": uuid.uuid4(),
        "title": "Evento",
        "description": "Descrição",
        "discount": Decimal("10.00"),
        "start_date": today - timedelta(days=1),
        "end_date": today + timedelta(days=30),
        "image_url": None,
        "active": True,
        "created_at": datetime(2026, 1, 1),
    }
    defaults.update(overrides)
    return Event(**defaults)


def test_list_events_excludes_inactive_by_default():
    repo = FakeEventRepository([_make_event(title="Ativo", active=True), _make_event(title="Inativo", active=False)])

    result = list_events(repo, EventFilters())

    assert [e.title for e in result] == ["Ativo"]


def test_list_events_active_only_false_includes_inactive():
    repo = FakeEventRepository([_make_event(title="Ativo", active=True), _make_event(title="Inativo", active=False)])

    result = list_events(repo, EventFilters(active_only=False))

    assert {e.title for e in result} == {"Ativo", "Inativo"}


def test_list_events_current_only_excludes_expired():
    today = date.today()
    repo = FakeEventRepository(
        [
            _make_event(title="Vigente", start_date=today - timedelta(days=1), end_date=today + timedelta(days=1)),
            _make_event(
                title="Expirado", start_date=today - timedelta(days=30), end_date=today - timedelta(days=10)
            ),
        ]
    )

    result = list_events(repo, EventFilters(current_only=True))

    assert [e.title for e in result] == ["Vigente"]
