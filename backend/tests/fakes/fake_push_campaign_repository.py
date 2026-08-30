import dataclasses
import uuid
from datetime import datetime

from app.domain.push import PushCampaign


class FakePushCampaignRepository:
    def __init__(self, campaigns: list[PushCampaign] | None = None) -> None:
        self._campaigns = {c.id: c for c in (campaigns or [])}

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
        campaign = PushCampaign(
            id=uuid.uuid4(),
            title=title,
            message=message,
            url=url,
            target_type=target_type,
            target_customer_ids=target_customer_ids,
            customers_targeted=customers_targeted,
            sent=0,
            failed=0,
            removed=0,
            created_at=datetime.now(),
        )
        self._campaigns[campaign.id] = campaign
        return campaign

    def record_result(self, campaign_id: uuid.UUID, sent: int, failed: int, removed: int) -> None:
        campaign = self._campaigns[campaign_id]
        self._campaigns[campaign_id] = dataclasses.replace(campaign, sent=sent, failed=failed, removed=removed)

    def list_recent(self, limit: int = 20) -> list[PushCampaign]:
        results = sorted(self._campaigns.values(), key=lambda c: c.created_at, reverse=True)
        return results[:limit]
