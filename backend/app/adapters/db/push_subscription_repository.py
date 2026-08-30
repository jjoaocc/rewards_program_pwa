import uuid

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.adapters.db.mapping import row_to_domain
from app.domain.push import PushSubscription, SubscriptionConflictError
from app.models import PushSubscription as PushSubscriptionModel


def _to_domain(row: PushSubscriptionModel) -> PushSubscription:
    return row_to_domain(PushSubscription, row)


class SqlAlchemyPushSubscriptionRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def subscribe(
        self, customer_id: str, endpoint: str, p256dh: str, auth: str, user_agent: str | None
    ) -> tuple[PushSubscription, bool]:
        """Registra ou reatribui a subscription (dono é quem assinou por último, evita
        vazar push do dono antigo pro dispositivo de outra pessoa se o endpoint for
        reusado com outro login sem unsubscribe)."""
        existing = self._db.query(PushSubscriptionModel).filter(PushSubscriptionModel.endpoint == endpoint).first()

        if existing:
            existing.customer_id = customer_id
            existing.p256dh = p256dh
            existing.auth = auth
            existing.user_agent = user_agent
            self._db.commit()
            return _to_domain(existing), False

        row = PushSubscriptionModel(
            customer_id=customer_id, endpoint=endpoint, p256dh=p256dh, auth=auth, user_agent=user_agent
        )
        try:
            self._db.add(row)
            self._db.commit()
            self._db.refresh(row)
        except IntegrityError as e:
            self._db.rollback()
            raise SubscriptionConflictError() from e

        return _to_domain(row), True

    def unsubscribe(self, customer_id: str) -> int:
        deleted = (
            self._db.query(PushSubscriptionModel).filter(PushSubscriptionModel.customer_id == customer_id).delete()
        )
        self._db.commit()
        return deleted

    def list_for_customer(self, customer_id: str) -> list[PushSubscription]:
        rows = self._db.query(PushSubscriptionModel).filter(PushSubscriptionModel.customer_id == customer_id).all()
        return [_to_domain(row) for row in rows]

    def list_for_customers(self, customer_ids: list[str]) -> list[PushSubscription]:
        rows = (
            self._db.query(PushSubscriptionModel)
            .filter(PushSubscriptionModel.customer_id.in_(customer_ids))
            .all()
        )
        return [_to_domain(row) for row in rows]

    def list_all(self) -> list[PushSubscription]:
        rows = self._db.query(PushSubscriptionModel).all()
        return [_to_domain(row) for row in rows]

    def remove_many(self, subscription_ids: list[uuid.UUID]) -> None:
        if not subscription_ids:
            return
        self._db.query(PushSubscriptionModel).filter(PushSubscriptionModel.id.in_(subscription_ids)).delete(
            synchronize_session=False
        )
        self._db.commit()
