import uuid
from typing import Protocol

from app.domain.push import PushSubscription


class PushSubscriptionRepository(Protocol):
    def subscribe(
        self, customer_id: str, endpoint: str, p256dh: str, auth: str, user_agent: str | None
    ) -> tuple[PushSubscription, bool]:
        """Registra ou reatribui a subscription pro endpoint. Retorna (subscription, created).

        Levanta SubscriptionConflictError em corrida entre requisições concorrentes.
        """
        ...

    def unsubscribe(self, customer_id: str) -> int:
        """Remove todas as subscriptions do cliente. Retorna a quantidade removida."""
        ...

    def list_for_customer(self, customer_id: str) -> list[PushSubscription]: ...

    def list_for_customers(self, customer_ids: list[str]) -> list[PushSubscription]: ...

    def list_all(self) -> list[PushSubscription]: ...

    def remove_many(self, subscription_ids: list[uuid.UUID]) -> None:
        """Remove subscriptions por id — usado pra limpar as que voltaram HTTP 410
        (expiradas/revogadas) depois de um envio."""
        ...
