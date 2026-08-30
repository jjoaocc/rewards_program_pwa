from typing import Protocol

from app.domain.event import Event, EventFilters


class EventRepository(Protocol):
    def list(self, filters: EventFilters) -> list[Event]: ...
