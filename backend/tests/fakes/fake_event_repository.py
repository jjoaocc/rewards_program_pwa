from datetime import date

from app.domain.event import Event, EventFilters


class FakeEventRepository:
    def __init__(self, events: list[Event] | None = None) -> None:
        self._events = list(events or [])

    def list(self, filters: EventFilters) -> list[Event]:
        results = self._events

        if filters.active_only:
            results = [e for e in results if e.active]

        if filters.current_only:
            today = date.today()
            results = [e for e in results if e.start_date <= today <= e.end_date]

        return sorted(results, key=lambda e: e.start_date, reverse=True)
