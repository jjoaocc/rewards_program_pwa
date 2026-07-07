-- Adiciona email secundário ao cliente.
-- O campo já existia na UI (ContactsSection) e no tipo `Customer` do frontend, mas
-- nunca teve coluna no banco nem suporte no backend — a edição era descartada em
-- silêncio ao salvar o perfil.

ALTER TABLE customers ADD COLUMN IF NOT EXISTS secondary_email VARCHAR(255);
