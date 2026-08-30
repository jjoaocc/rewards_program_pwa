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
        """Cria a campanha e uma notificação in-app pra cada cliente em
        `customer_ids_to_notify`, tudo num único commit (usado por envio em lote/
        broadcast, pra não virar 1 commit por cliente)."""
        ...

    def record_result(self, campaign_id: uuid.UUID, sent: int, failed: int, removed: int) -> None: ...

    def list_recent(self, limit: int = 20) -> list[PushCampaign]: ...
