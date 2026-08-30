import uuid

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.domain.push import PushCampaign
from app.models import PushCampaign as PushCampaignModel


def _to_domain(row: PushCampaignModel) -> PushCampaign:
    return PushCampaign(
        id=row.id,
        title=row.title,
        message=row.message,
        url=row.url,
        target_type=row.target_type,
        target_customer_ids=row.target_customer_ids,
        customers_targeted=row.customers_targeted,
        sent=row.sent,
        failed=row.failed,
        removed=row.removed,
        created_at=row.created_at,
    )


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

    def record_result(self, campaign_id: uuid.UUID, sent: int, failed: int, removed: int) -> None:
        row = self._db.query(PushCampaignModel).filter(PushCampaignModel.id == campaign_id).first()
        if row is None:
            raise ValueError(f"campaign {campaign_id} not found")
        row.sent = sent
        row.failed = failed
        row.removed = removed
        self._db.commit()

    def list_recent(self, limit: int = 20) -> list[PushCampaign]:
        rows = self._db.query(PushCampaignModel).order_by(desc(PushCampaignModel.created_at)).limit(limit).all()
        return [_to_domain(row) for row in rows]
