-- seed_data.sql
-- Dados mock completos para desenvolvimento

-- Limpar dados existentes (cuidado em produção!)
TRUNCATE TABLE notifications, transactions, addresses, customers CASCADE;

-- ============================================
-- CLIENTES
-- ============================================

-- Cliente 1: João Silva (CPF) - senha: tmx
INSERT INTO customers (id, name, email, password_hash, document, document_type, birth_date, phone, mobile, balance, is_active) 
VALUES 
('7742', 'João Silva', 'joao.silva@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eedgHQbT1E4G', '123.456.789-00', 'cpf', '1990-05-15', '(47) 3333-4444', '(47) 99999-8888', 1234.56, true);

-- Cliente 2: Maria Santos (CPF) - senha: tmx
INSERT INTO customers (id, name, email, password_hash, document, document_type, birth_date, phone, mobile, balance, is_active) 
VALUES 
('8851', 'Maria Santos', 'maria.santos@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eedgHQbT1E4G', '987.654.321-00', 'cpf', '1985-08-20', '(47) 3222-1111', '(47) 98888-7777', 567.89, true);

-- Cliente 3: Pedro Oliveira (CPF) - senha: tmx
INSERT INTO customers (id, name, email, password_hash, document, document_type, birth_date, phone, mobile, balance, is_active) 
VALUES 
('9923', 'Pedro Oliveira', 'pedro.oliveira@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eedgHQbT1E4G', '456.789.123-00', 'cpf', '1995-03-10', '(47) 3444-5555', '(47) 97777-6666', 2450.30, true);

-- Cliente 4: Construções Ltda (CNPJ) - senha: tmx
INSERT INTO customers (id, name, email, password_hash, document, document_type, birth_date, phone, mobile, balance, is_active) 
VALUES 
('5501', 'Construções Silva Ltda', 'contato@construcoessilva.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eedgHQbT1E4G', '12.345.678/0001-90', 'cnpj', NULL, '(47) 3100-2000', '(47) 99100-2000', 5678.90, true);

-- Cliente 5: Ana Costa (CPF) - senha: tmx
INSERT INTO customers (id, name, email, password_hash, document, document_type, birth_date, phone, mobile, balance, is_active) 
VALUES 
('3342', 'Ana Costa', 'ana.costa@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eedgHQbT1E4G', '741.852.963-00', 'cpf', '1992-11-25', '(47) 3666-7788', '(47) 96666-5544', 89.45, true);

-- ============================================
-- ENDEREÇOS
-- ============================================

INSERT INTO addresses (customer_id, zip_code, street, number, complement, neighborhood, city, state, is_primary)
VALUES 
('7742', '89200-000', 'Rua das Flores', '123', 'Apto 201', 'Centro', 'Joinville', 'SC', true),
('8851', '89201-100', 'Av. Beira Rio', '456', NULL, 'Saguaçu', 'Joinville', 'SC', true),
('9923', '89202-200', 'Rua XV de Novembro', '789', 'Casa', 'América', 'Joinville', 'SC', true),
('5501', '89203-300', 'Rua Industrial', '1500', 'Galpão 3', 'Distrito Industrial', 'Joinville', 'SC', true),
('3342', '89204-400', 'Rua Paraná', '234', 'Apto 102', 'Anita Garibaldi', 'Joinville', 'SC', true);

-- ============================================
-- TRANSAÇÕES (últimos 3 meses)
-- ============================================

-- João Silva (7742) - 8 transações
INSERT INTO transactions (customer_id, type, amount, description, store, created_at)
VALUES 
('7742', 'credit', 156.78, 'Cashback da compra #8923', 'Loja Matriz - Centro', '2026-02-15 14:32:00'),
('7742', 'credit', 89.45, 'Cashback da compra #8891', 'Loja Norte', '2026-02-10 10:15:00'),
('7742', 'debit', 50.00, 'Resgate de créditos', 'Loja Sul', '2026-02-05 16:20:00'),
('7742', 'credit', 234.50, 'Cashback da compra #8756', 'Loja Matriz - Centro', '2026-01-28 09:45:00'),
('7742', 'credit', 67.80, 'Cashback da compra #8623', 'Loja Oeste', '2026-01-20 15:10:00'),
('7742', 'debit', 100.00, 'Resgate de créditos', 'Loja Norte', '2026-01-15 11:30:00'),
('7742', 'credit', 445.67, 'Cashback da compra #8512', 'Loja Sul', '2026-01-08 13:25:00'),
('7742', 'credit', 123.45, 'Cashback da compra #8401', 'Loja Matriz - Centro', '2025-12-28 10:00:00');

-- Maria Santos (8851) - 6 transações
INSERT INTO transactions (customer_id, type, amount, description, store, created_at)
VALUES 
('8851', 'credit', 78.90, 'Cashback da compra #9234', 'Loja Norte', '2026-02-18 11:20:00'),
('8851', 'credit', 156.00, 'Cashback da compra #9187', 'Loja Matriz - Centro', '2026-02-12 14:45:00'),
('8851', 'credit', 234.56, 'Cashback da compra #9098', 'Loja Sul', '2026-01-30 16:00:00'),
('8851', 'debit', 80.00, 'Resgate de créditos', 'Loja Oeste', '2026-01-22 09:30:00'),
('8851', 'credit', 89.12, 'Cashback da compra #8967', 'Loja Norte', '2026-01-10 12:15:00'),
('8851', 'credit', 167.89, 'Cashback da compra #8845', 'Loja Matriz - Centro', '2025-12-20 10:40:00');

-- Pedro Oliveira (9923) - 10 transações
INSERT INTO transactions (customer_id, type, amount, description, store, created_at)
VALUES 
('9923', 'credit', 567.80, 'Cashback da compra #7651', 'Loja Matriz - Centro', '2026-02-19 15:30:00'),
('9923', 'credit', 345.90, 'Cashback da compra #7598', 'Loja Sul', '2026-02-14 11:00:00'),
('9923', 'credit', 234.50, 'Cashback da compra #7512', 'Loja Norte', '2026-02-08 13:45:00'),
('9923', 'debit', 150.00, 'Resgate de créditos', 'Loja Oeste', '2026-02-01 10:20:00'),
('9923', 'credit', 678.90, 'Cashback da compra #7423', 'Loja Matriz - Centro', '2026-01-25 14:30:00'),
('9923', 'credit', 123.45, 'Cashback da compra #7389', 'Loja Sul', '2026-01-18 16:15:00'),
('9923', 'debit', 200.00, 'Resgate de créditos', 'Loja Norte', '2026-01-12 09:00:00'),
('9923', 'credit', 890.12, 'Cashback da compra #7234', 'Loja Matriz - Centro', '2026-01-05 11:45:00'),
('9923', 'credit', 456.78, 'Cashback da compra #7156', 'Loja Oeste', '2025-12-22 13:20:00'),
('9923', 'credit', 234.67, 'Cashback da compra #7089', 'Loja Sul', '2025-12-15 15:10:00');

-- Construções Silva Ltda (5501) - 7 transações (valores maiores)
INSERT INTO transactions (customer_id, type, amount, description, store, created_at)
VALUES 
('5501', 'credit', 1234.56, 'Cashback da compra #5678', 'Loja Matriz - Centro', '2026-02-17 10:00:00'),
('5501', 'credit', 890.45, 'Cashback da compra #5623', 'Loja Oeste', '2026-02-09 14:30:00'),
('5501', 'debit', 500.00, 'Resgate de créditos', 'Loja Norte', '2026-02-02 11:15:00'),
('5501', 'credit', 2345.67, 'Cashback da compra #5512', 'Loja Matriz - Centro', '2026-01-27 09:45:00'),
('5501', 'credit', 1567.89, 'Cashback da compra #5467', 'Loja Sul', '2026-01-14 13:00:00'),
('5501', 'debit', 1000.00, 'Resgate de créditos', 'Loja Matriz - Centro', '2026-01-07 10:30:00'),
('5501', 'credit', 3456.78, 'Cashback da compra #5389', 'Loja Oeste', '2025-12-19 15:20:00');

-- Ana Costa (3342) - 5 transações
INSERT INTO transactions (customer_id, type, amount, description, store, created_at)
VALUES 
('3342', 'credit', 45.67, 'Cashback da compra #4512', 'Loja Norte', '2026-02-16 12:30:00'),
('3342', 'credit', 78.90, 'Cashback da compra #4467', 'Loja Sul', '2026-02-07 10:45:00'),
('3342', 'credit', 34.56, 'Cashback da compra #4389', 'Loja Matriz - Centro', '2026-01-29 14:15:00'),
('3342', 'debit', 30.00, 'Resgate de créditos', 'Loja Oeste', '2026-01-19 16:00:00'),
('3342', 'credit', 56.78, 'Cashback da compra #4256', 'Loja Norte', '2026-01-11 11:20:00');

-- ============================================
-- NOTIFICAÇÕES
-- ============================================

-- João Silva (7742) - 5 notificações
INSERT INTO notifications (customer_id, title, message, type, read, created_at)
VALUES 
('7742', '🎉 Super Oferta de Semana!', 'Cimento 50kg com 25% OFF! Válido até domingo. Venha conferir!', 'promotion', false, '2026-02-20 14:30:00'),
('7742', '💰 Você acumulou R$ 156,78!', 'Parabéns! Sua última compra rendeu R$ 156,78 em créditos.', 'reward', false, '2026-02-15 14:35:00'),
('7742', '🛠️ Ferramentas em Promoção', 'Furadeira Bosch, Parafusadeira e mais! Até 40% de desconto.', 'promotion', true, '2026-02-10 16:00:00'),
('7742', '📦 Novo Estoque Disponível', 'Telhas coloniais e tijolos cerâmicos chegaram! Estoque limitado.', 'promotion', true, '2026-02-05 11:20:00'),
('7742', '⚡ Flash Sale - Tintas', 'Tintas Suvinil com 30% OFF por 24h! Corre que acaba!', 'promotion', true, '2026-02-01 08:00:00');

-- Maria Santos (8851) - 4 notificações
INSERT INTO notifications (customer_id, title, message, type, read, created_at)
VALUES 
('8851', '🏆 Você é cliente VIP!', 'Parabéns! Você alcançou o status VIP com seus créditos acumulados.', 'system', false, '2026-02-18 10:00:00'),
('8851', '💰 Você acumulou R$ 78,90!', 'Sua última compra rendeu R$ 78,90 em cashback.', 'reward', true, '2026-02-18 11:25:00'),
('8851', '🎁 Promoção Exclusiva VIP', 'Como cliente VIP, você tem 10% extra em todas as compras este mês!', 'promotion', false, '2026-02-12 09:00:00'),
('8851', '📢 Lançamento de Produtos', 'Novos produtos de jardinagem chegaram! Confira na loja.', 'promotion', true, '2026-02-05 15:30:00');

-- Pedro Oliveira (9923) - 3 notificações
INSERT INTO notifications (customer_id, title, message, type, read, created_at)
VALUES 
('9923', '💰 Você acumulou R$ 567,80!', 'Excelente compra! Você ganhou R$ 567,80 em cashback.', 'reward', false, '2026-02-19 15:35:00'),
('9923', '🔥 Mega Queima de Estoque!', 'Descontos de até 60% em materiais hidráulicos. Não perca!', 'promotion', false, '2026-02-14 13:00:00'),
('9923', '📦 Seu pedido está disponível', 'O produto que você reservou chegou. Retire na loja matriz.', 'system', true, '2026-02-08 10:00:00');

-- Construções Silva (5501) - 2 notificações
INSERT INTO notifications (customer_id, title, message, type, read, created_at)
VALUES 
('5501', '💰 Grande acúmulo de créditos!', 'Sua empresa acumulou R$ 1.234,56 nesta compra. Ótimo negócio!', 'reward', false, '2026-02-17 10:05:00'),
('5501', '🏗️ Condições Especiais para Empresas', 'Consulte nosso time comercial para descontos em grandes volumes.', 'promotion', true, '2026-02-09 09:00:00');

-- Ana Costa (3342) - 2 notificações  
INSERT INTO notifications (customer_id, title, message, type, read, created_at)
VALUES 
('3342', '💰 Você acumulou R$ 45,67!', 'Sua compra rendeu R$ 45,67 em créditos.', 'reward', false, '2026-02-16 12:35:00'),
('3342', '🌸 Promoção Dia das Mulheres', 'Descontos especiais em ferramentas e materiais. Aproveite!', 'promotion', false, '2026-02-07 08:00:00');

-- ============================================
-- ESTATÍSTICAS FINAIS
-- ============================================

-- Verificar quantidade de registros
SELECT 'Clientes' as tabela, COUNT(*) as total FROM customers
UNION ALL
SELECT 'Endereços', COUNT(*) FROM addresses
UNION ALL
SELECT 'Transações', COUNT(*) FROM transactions
UNION ALL
SELECT 'Notificações', COUNT(*) FROM notifications;

-- Ver saldo de cada cliente
SELECT id, name, balance 
FROM customers 
ORDER BY balance DESC;