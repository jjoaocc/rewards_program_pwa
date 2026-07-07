import uuid

from sqlalchemy import TIMESTAMP, Column, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class PushCampaign(Base):
    """Registro histórico de um envio feito pelo painel admin (individual, pra uma
    lista de clientes selecionados, ou broadcast) — independente das linhas de
    Notification criadas por cliente, que não guardam o "envio" como uma ação única."""

    __tablename__ = "push_campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(80), nullable=False)
    message = Column(Text, nullable=False)
    url = Column(String(255), nullable=True)
    target_type = Column(String(20), nullable=False)  # 'individual' | 'selected' | 'broadcast'
    target_customer_ids = Column(Text, nullable=True)  # ids separados por vírgula; null no broadcast
    customers_targeted = Column(Integer, nullable=False, default=0)
    sent = Column(Integer, nullable=False, default=0)
    failed = Column(Integer, nullable=False, default=0)
    removed = Column(Integer, nullable=False, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now(), index=True)
