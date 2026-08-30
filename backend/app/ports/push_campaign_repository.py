import uuid
from typing import Protocol

from app.domain.push import PushCampaign


class PushCampaignRepository(Protocol):
    def create(
        self,
        title: str,
        message: str,
        url: str,
        *,
        target_type: str,
        target_customer_ids: str | None,
        customers_targeted: int,
    ) -> PushCampaign: ...

    def record_result(self, campaign_id: uuid.UUID, sent: int, failed: int, removed: int) -> None: ...

    def list_recent(self, limit: int = 20) -> list[PushCampaign]: ...
