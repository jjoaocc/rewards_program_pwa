-- Histórico de envios feitos pelo painel admin (individual, seleção de clientes, ou
-- broadcast). Independente da tabela `notifications`, que registra uma linha por
-- cliente notificado e não guarda o "envio" em si como uma ação única/agrupada.

CREATE TABLE IF NOT EXISTS push_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(80) NOT NULL,
    message TEXT NOT NULL,
    url VARCHAR(255),
    target_type VARCHAR(20) NOT NULL,
    target_customer_ids TEXT,
    customers_targeted INTEGER NOT NULL DEFAULT 0,
    sent INTEGER NOT NULL DEFAULT 0,
    failed INTEGER NOT NULL DEFAULT 0,
    removed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_push_campaigns_created_at ON push_campaigns (created_at);
