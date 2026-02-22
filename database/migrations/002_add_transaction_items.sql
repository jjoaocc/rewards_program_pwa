-- backend/migrations/add_transaction_items.sql

CREATE TABLE IF NOT EXISTS transaction_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    quantity    INTEGER NOT NULL DEFAULT 1,
    unit_price  DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);

-- Cola direto no psql ou adiciona ao mesmo arquivo

-- Pega os IDs das transações de crédito do João (7742)
-- Cashback da compra #8923
INSERT INTO transaction_items (transaction_id, name, quantity, unit_price, total_price)
SELECT id, 'Cimento CP-II 50kg', 10, 32.90, 329.00 FROM transactions WHERE description = 'Cashback da compra #8923' AND customer_id = '7742';

INSERT INTO transaction_items (transaction_id, name, quantity, unit_price, total_price)
SELECT id, 'Areia Média (m³)', 2, 85.00, 170.00 FROM transactions WHERE description = 'Cashback da compra #8923' AND customer_id = '7742';

INSERT INTO transaction_items (transaction_id, name, quantity, unit_price, total_price)
SELECT id, 'Tijolo Cerâmico 8 furos (cx)', 5, 45.00, 225.00 FROM transactions WHERE description = 'Cashback da compra #8923' AND customer_id = '7742';

-- Cashback da compra #8891
INSERT INTO transaction_items (transaction_id, name, quantity, unit_price, total_price)
SELECT id, 'Tinta Acrílica Premium 18L', 2, 145.00, 290.00 FROM transactions WHERE description = 'Cashback da compra #8891' AND customer_id = '7742';

INSERT INTO transaction_items (transaction_id, name, quantity, unit_price, total_price)
SELECT id, 'Rolo de Lã 23cm', 3, 8.50, 25.50 FROM transactions WHERE description = 'Cashback da compra #8891' AND customer_id = '7742';

-- Cashback da compra #8756
INSERT INTO transaction_items (transaction_id, name, quantity, unit_price, total_price)
SELECT id, 'Piso Cerâmico Premium (cx)', 20, 85.00, 1700.00 FROM transactions WHERE description = 'Cashback da compra #8756' AND customer_id = '7742';

INSERT INTO transaction_items (transaction_id, name, quantity, unit_price, total_price)
SELECT id, 'Argamassa AC-II 20kg', 15, 28.00, 420.00 FROM transactions WHERE description = 'Cashback da compra #8756' AND customer_id = '7742';

-- Cashback da compra #8512
INSERT INTO transaction_items (transaction_id, name, quantity, unit_price, total_price)
SELECT id, 'Furadeira de Impacto 500W', 1, 289.00, 289.00 FROM transactions WHERE description = 'Cashback da compra #8512' AND customer_id = '7742';

INSERT INTO transaction_items (transaction_id, name, quantity, unit_price, total_price)
SELECT id, 'Parafusadeira Sem Fio 12V', 1, 349.00, 349.00 FROM transactions WHERE description = 'Cashback da compra #8512' AND customer_id = '7742';

INSERT INTO transaction_items (transaction_id, name, quantity, unit_price, total_price)
SELECT id, 'Jogo de Brocas (12 peças)', 2, 45.00, 90.00 FROM transactions WHERE description = 'Cashback da compra #8512' AND customer_id = '7742';