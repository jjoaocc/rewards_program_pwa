-- 003_add_push_subscriptions.sql
-- Criada em: 2026-02-22
-- Descrição: Adiciona tabela de subscriptions Web Push (VAPID)
--            para envio de push notifications via pywebpush.
--
-- ATENÇÃO: Esta migração já foi aplicada via SQLAlchemy (Base.metadata.create_all)
--          durante o deploy inicial. Este arquivo serve como documentação histórica.
--          NÃO execute novamente se a tabela já existir.

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(20) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    endpoint    TEXT NOT NULL,
    p256dh      TEXT NOT NULL,
    auth        TEXT NOT NULL,
    user_agent  VARCHAR(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_push_subscription_endpoint UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS ix_push_subscriptions_customer_id
    ON push_subscriptions (customer_id);