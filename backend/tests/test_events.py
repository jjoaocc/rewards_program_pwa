from datetime import date, timedelta

from app.models import Event


def _make_event(db_session, **overrides):
    today = date.today()
    defaults = {
        "title": "Evento Teste",
        "description": "Descrição teste",
        "discount": "10.00",
        "start_date": today - timedelta(days=1),
        "end_date": today + timedelta(days=30),
        "active": True,
    }
    defaults.update(overrides)
    event = Event(**defaults)
    db_session.add(event)
    db_session.commit()
    return event


def test_get_events_does_not_require_authentication(client, db_session):
    _make_event(db_session)

    response = client.get("/api/v1/events")

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_events_excludes_inactive_by_default(client, db_session):
    _make_event(db_session, active=True, title="Ativo")
    _make_event(db_session, active=False, title="Inativo")

    response = client.get("/api/v1/events")

    assert response.status_code == 200
    titles = [e["title"] for e in response.json()]
    assert titles == ["Ativo"]


def test_get_events_active_only_false_includes_inactive(client, db_session):
    _make_event(db_session, active=True, title="Ativo")
    _make_event(db_session, active=False, title="Inativo")

    response = client.get("/api/v1/events", params={"active_only": False})

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_events_current_only_excludes_expired(client, db_session):
    today = date.today()
    _make_event(
        db_session,
        title="Vigente",
        start_date=today - timedelta(days=1),
        end_date=today + timedelta(days=1),
    )
    _make_event(
        db_session,
        title="Expirado",
        start_date=today - timedelta(days=30),
        end_date=today - timedelta(days=10),
    )

    response = client.get("/api/v1/events", params={"current_only": True})

    assert response.status_code == 200
    titles = [e["title"] for e in response.json()]
    assert titles == ["Vigente"]
