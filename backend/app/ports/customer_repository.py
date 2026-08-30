from datetime import datetime
from typing import Protocol

from app.domain.customer import Customer, CustomerStats


class CustomerRepository(Protocol):
    def get_by_id(self, customer_id: str) -> Customer | None: ...

    def get_by_identifier(self, identifier: str) -> Customer | None:
        """Busca por email ou id (login aceita qualquer um dos dois)."""
        ...

    def get_profile(self, customer_id: str) -> Customer | None:
        """Como get_by_id, mas inclui o endereço primário quando existir."""
        ...

    def update(self, customer_id: str, update_data: dict) -> Customer:
        """Levanta EmailAlreadyInUseError se o novo email já pertencer a outro cliente."""
        ...

    def get_stats(self, customer_id: str, member_since: datetime) -> CustomerStats: ...

    def search(self, query: str, limit: int) -> list[Customer]:
        """Busca por nome/email/id (ilike), pro painel admin escolher destinatários."""
        ...

    def filter_existing_ids(self, customer_ids: list[str]) -> list[str]:
        """Dado uma lista de ids, retorna só os que existem de verdade."""
        ...
