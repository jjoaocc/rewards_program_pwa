import dataclasses
import uuid
from datetime import datetime
from typing import Any

from app.domain.push import PushCampaign


class FakePushCampaignRepository:
    def __init__(self, campaigns: list[PushCampaign] | None = None, notification_repo: Any = None) -> None:
        self._campaigns = {c.id: c for c in (campaigns or [])}
        # Opcional: quando informado, create_and_notify() também cria as notificações
        # ali (só pra permitir asserção nos testes; em produção isso é 1 commit só,
        # aqui não tem transação de verdade pra coordenar).
        self._notification_repo = notification_repo

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
        campaign = self.create(
            title,
            message,
            url,
            target_type=target_type,
            target_customer_ids=target_customer_ids,
            customers_targeted=len(customer_ids_to_notify),
        )
        if self._notification_repo is not None:
            for customer_id in customer_ids_to_notify:
                self._notification_repo.create(customer_id, title, message, action_url=url)
        return campaign

    def record_result(self, campaign_id: uuid.UUID, sent: int, failed: int, removed: int) -> None:
        campaign = self._campaigns[campaign_id]
        self._campaigns[campaign_id] = dataclasses.replace(campaign, sent=sent, failed=failed, removed=removed)

    def list_recent(self, limit: int = 20) -> list[PushCampaign]:
        results = sorted(self._campaigns.values(), key=lambda c: c.created_at, reverse=True)
        return results[:limit]
