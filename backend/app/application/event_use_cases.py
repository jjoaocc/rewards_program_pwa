from app.domain.event import Event, EventFilters
from app.ports.event_repository import EventRepository


def list_events(repo: EventRepository, filters: EventFilters) -> list[Event]:
    return repo.list(filters)
