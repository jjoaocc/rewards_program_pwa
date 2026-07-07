-- Remove a funcionalidade de resgates (redemptions).
-- A tabela foi criada pela migração 001 junto com produtos/eventos, mas nunca teve
-- endpoint na API nem tela no frontend — só existiam os dados mock da 001.
-- Decisão: não implementar resgate como feature, removida do código do backend
-- (models/schemas/relationships) e agora também do banco.

DROP TABLE IF EXISTS redemptions CASCADE;
