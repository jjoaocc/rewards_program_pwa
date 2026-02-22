-- init.sql
-- Schema inicial do banco de dados

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    document VARCHAR(18) UNIQUE NOT NULL,
    document_type VARCHAR(4) NOT NULL CHECK (document_type IN ('cpf', 'cnpj')),
    birth_date DATE,
    phone VARCHAR(20),
    mobile VARCHAR(20),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Endereços
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(20) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    zip_code VARCHAR(9) NOT NULL,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(10) NOT NULL,
    complement VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Transações
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(20) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    store VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(20) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('promotion', 'reward', 'system')),
    read BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_document ON customers(document);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_notifications_customer ON notifications(customer_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dados de teste (MOCK)
-- Senha: tmx (hash bcrypt)
INSERT INTO customers (id, name, email, password_hash, document, document_type, birth_date, phone, mobile, balance) 
VALUES 
    ('7742', 'João Silva', 'joao.silva@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eedgHQbT1E4G', '123.456.789-00', 'cpf', '1990-05-15', '(47) 3333-4444', '(47) 99999-8888', 1234.56)
ON CONFLICT (id) DO NOTHING;

INSERT INTO addresses (customer_id, zip_code, street, number, neighborhood, city, state)
VALUES 
    ('7742', '89200-000', 'Rua das Flores', '123', 'Centro', 'Joinville', 'SC')
ON CONFLICT DO NOTHING;

-- Transações mock
INSERT INTO transactions (customer_id, type, amount, description, store, created_at)
VALUES 
    ('7742', 'credit', 156.78, 'Cashback da compra #8923', 'Loja Matriz - Centro', '2026-02-01 14:32:00'),
    ('7742', 'credit', 89.45, 'Cashback da compra #8891', 'Loja Norte', '2026-01-28 10:15:00'),
    ('7742', 'debit', 50.00, 'Resgate de créditos', 'Loja Sul', '2026-01-25 16:20:00')
ON CONFLICT DO NOTHING;

-- Notificações mock
INSERT INTO notifications (customer_id, title, message, type, read, created_at)
VALUES 
    ('7742', '🎉 Super Oferta de Semana!', 'Cimento 50kg com 25% OFF! Válido até domingo.', 'promotion', false, '2026-02-07 14:30:00'),
    ('7742', '💰 Você acumulou R$ 45,00!', 'Parabéns! Sua última compra rendeu créditos.', 'reward', false, '2026-02-06 09:15:00')
ON CONFLICT DO NOTHING;