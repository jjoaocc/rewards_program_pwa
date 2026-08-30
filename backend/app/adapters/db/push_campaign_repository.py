import uuid

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.adapters.db.mapping import row_to_domain
from app.domain.push import PushCampaign
from app.models import Notification as NotificationModel
from app.models import PushCampaign as PushCampaignModel


def _to_domain(row: PushCampaignModel) -> PushCampaign:
    return row_to_domain(PushCampaign, row)


class SqlAlchemyPushCampaignRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def create(
        self,
        title: str,
        message: str,
        url: str,
        *,
        target_type: str,
        target_customer_ids: str | None,
        customers_targeted: int,
    ) -> PushCampaign:
        row = PushCampaignModel(
            title=title,
            message=message,
            url=url,
            target_type=target_type,
            target_customer_ids=target_customer_ids,
            customers_targeted=customers_targeted,
        )
        self._db.add(row)
        self._db.commit()
        self._db.refresh(row)
        return _to_domain(row)

    def create_and_notify(
        self,
        title: str,
        message: str,
        url: str,
        *,
        target_type: str,
        target_customer_ids: str | None,
        customer_ids_to_notify: list[str],
    ) -> PushCampaign:
        campaign_row = PushCampaignModel(
            title=title,
            message=message,
            url=url,
            target_type=target_type,
            target_customer_ids=target_customer_ids,
            customers_targeted=len(customer_ids_to_notify),
        )
        notifications = [
            NotificationModel(customer_id=customer_id, title=title, message=message, type="system", action_url=url)
            for customer_id in customer_ids_to_notify
        ]
        self._db.add(campaign_row)
        self._db.add_all(notifications)
        self._db.commit()
        self._db.refresh(campaign_row)
        return _to_domain(campaign_row)

    def record_result(self, campaign_id: uuid.UUID, sent: int, failed: int, removed: int) -> None:
        # db.get() consulta o identity map da sessão antes de ir ao banco — a campanha
        # foi criada/carregada nesta mesma sessão poucas linhas atrás (em create() ou
        # create_and_notify()), então isso normalmente não gera um SELECT novo.
        row = self._db.get(PushCampaignModel, campaign_id)
        if row is None:
            raise ValueError(f"campaign {campaign_id} not found")
        row.sent = sent
        row.failed = failed
        row.removed = removed
        self._db.commit()

    def list_recent(self, limit: int = 20) -> list[PushCampaign]:
        rows = self._db.query(PushCampaignModel).order_by(desc(PushCampaignModel.created_at)).limit(limit).all()
        return [_to_domain(row) for row in rows]
