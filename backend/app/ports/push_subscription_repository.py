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
