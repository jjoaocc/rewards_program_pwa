import uuid
from datetime import datetime

from app.domain.push import PushSubscription


class FakePushSubscriptionRepository:
    def __init__(self, subscriptions: list[PushSubscription] | None = None) -> None:
        self._subscriptions = {s.endpoint: s for s in (subscriptions or [])}

    def subscribe(
        self, customer_id: str, endpoint: str, p256dh: str, auth: str, user_agent: str | None
    ) -> tuple[PushSubscription, bool]:
        existing = self._subscriptions.get(endpoint)
        created = existing is None
        sub = PushSubscription(
            id=existing.id if existing else uuid.uuid4(),
            customer_id=customer_id,
            endpoint=endpoint,
            p256dh=p256dh,
            auth=auth,
            user_agent=user_agent,
            created_at=existing.created_at if existing else datetime.now(),
        )
        self._subscriptions[endpoint] = sub
        return sub, created

    def unsubscribe(self, customer_id: str) -> int:
        to_remove = [ep for ep, sub in self._subscriptions.items() if sub.customer_id == customer_id]
        for ep in to_remove:
            del self._subscriptions[ep]
        return len(to_remove)

    def list_for_customer(self, customer_id: str) -> list[PushSubscription]:
        return [s for s in self._subscriptions.values() if s.customer_id == customer_id]

    def list_for_customers(self, customer_ids: list[str]) -> list[PushSubscription]:
        return [s for s in self._subscriptions.values() if s.customer_id in customer_ids]

    def list_all(self) -> list[PushSubscription]:
        return list(self._subscriptions.values())

    def remove_many(self, subscription_ids: list[uuid.UUID]) -> None:
        to_remove = [ep for ep, sub in self._subscriptions.items() if sub.id in subscription_ids]
        for ep in to_remove:
            del self._subscriptions[ep]
