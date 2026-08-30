import uuid
from datetime import datetime

from sqlalchemy import TIMESTAMP, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PushCampaign(Base):
    """Registro histórico de um envio feito pelo painel admin (individual, pra uma
    lista de clientes selecionados, ou broadcast), independente das linhas de
    Notification criadas por cliente, que não guardam o "envio" como uma ação única."""

    __tablename__ = "push_campaigns"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(80), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    target_type: Mapped[str] = mapped_column(String(20), nullable=False)  # 'individual' | 'selected' | 'broadcast'
    target_customer_ids: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )  # ids separados por vírgula; null no broadcast
    customers_targeted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sent: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    removed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now(), index=True)
