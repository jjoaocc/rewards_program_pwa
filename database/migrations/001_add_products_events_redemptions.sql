-- update_schema_and_seed.sql (VERSÃO CORRIGIDA)
-- Adiciona tabelas de produtos, resgates e eventos com dados mock

-- ============================================
-- CRIAR NOVAS TABELAS
-- ============================================

-- Tabela de Produtos para Resgate
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    points_cost DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('ferramenta', 'material', 'vale-compra', 'brinde')),
    stock INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Resgates (Histórico de Produtos Resgatados)
CREATE TABLE IF NOT EXISTS redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(20) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    points_used DECIMAL(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Eventos/Promoções (ADICIONAR ESTA)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    discount DECIMAL(5, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    image_url VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_redemptions_customer ON redemptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_product ON redemptions(product_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_date ON redemptions(redeemed_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(active);

-- ============================================
-- PRODUTOS PARA RESGATE
-- ============================================

-- Ferramentas
INSERT INTO products (name, description, points_cost, category, stock, active, image_url)
VALUES 
('Furadeira de Impacto 500W', 'Furadeira profissional com maleta e acessórios. Ideal para concreto e alvenaria.', 450.00, 'ferramenta', 15, true, 'https://exemplo.com/furadeira.jpg'),
('Parafusadeira Sem Fio 12V', 'Kit completo com bateria e carregador. 2 baterias de lítio.', 350.00, 'ferramenta', 20, true, 'https://exemplo.com/parafusadeira.jpg'),
('Jogo de Chaves Phillips e Fenda', 'Set com 12 peças profissionais. Cabos emborrachados.', 80.00, 'ferramenta', 50, true, 'https://exemplo.com/chaves.jpg'),
('Trena Laser Digital 40m', 'Medição precisa com display LCD. Função área e volume.', 220.00, 'ferramenta', 10, true, 'https://exemplo.com/trena-laser.jpg'),
('Nível a Laser Automático', 'Nivelamento automático com tripé. Alcance de 30m.', 380.00, 'ferramenta', 8, true, 'https://exemplo.com/nivel-laser.jpg'),
('Serra Tico-Tico 450W', 'Cortes precisos em madeira e metal. Velocidade variável.', 280.00, 'ferramenta', 12, true, 'https://exemplo.com/serra.jpg'),
('Kit Ferramentas 100 Peças', 'Maleta completa com alicates, chaves, martelo e mais.', 420.00, 'ferramenta', 18, true, 'https://exemplo.com/kit-100.jpg'),
('Lixadeira Orbital 220W', 'Acabamento perfeito em madeira. Sistema de coleta de pó.', 190.00, 'ferramenta', 14, true, 'https://exemplo.com/lixadeira.jpg');

-- Materiais de Construção
INSERT INTO products (name, description, points_cost, category, stock, active, image_url)
VALUES 
('Cimento CP-II 50kg', 'Saco de cimento Portland CP-II ideal para obras gerais.', 45.00, 'material', 100, true, 'https://exemplo.com/cimento.jpg'),
('Argamassa AC-I 20kg', 'Argamassa para assentamento de pisos e azulejos.', 35.00, 'material', 80, true, 'https://exemplo.com/argamassa.jpg'),
('Rejunte Flexível 1kg - Branco', 'Rejunte acrílico flexível para áreas úmidas.', 18.00, 'material', 120, true, 'https://exemplo.com/rejunte.jpg'),
('Tinta Acrílica Premium 18L - Branco', 'Tinta lavável para interiores. Alto rendimento.', 320.00, 'material', 30, true, 'https://exemplo.com/tinta.jpg'),
('Cerâmica 45x45cm - Caixa', 'Porcelanato acetinado alta resistência. Caixa com 2,03m².', 180.00, 'material', 40, true, 'https://exemplo.com/ceramica.jpg'),
('Torneira Monocomando Cromada', 'Torneira para pia com arejador. Garantia 5 anos.', 160.00, 'material', 25, true, 'https://exemplo.com/torneira.jpg'),
('Kit Elétrico Tomadas e Interruptores', '10 tomadas + 5 interruptores padrão brasileiro.', 95.00, 'material', 60, true, 'https://exemplo.com/eletrico.jpg');

-- Vale-Compras
INSERT INTO products (name, description, points_cost, category, stock, active, image_url)
VALUES 
('Vale-Compra R$ 50,00', 'Crédito de R$ 50,00 para usar em qualquer loja da rede.', 50.00, 'vale-compra', 999, true, 'https://exemplo.com/vale-50.jpg'),
('Vale-Compra R$ 100,00', 'Crédito de R$ 100,00 para usar em qualquer loja da rede.', 100.00, 'vale-compra', 999, true, 'https://exemplo.com/vale-100.jpg'),
('Vale-Compra R$ 200,00', 'Crédito de R$ 200,00 para usar em qualquer loja da rede.', 200.00, 'vale-compra', 999, true, 'https://exemplo.com/vale-200.jpg'),
('Vale-Compra R$ 500,00', 'Crédito de R$ 500,00 para usar em qualquer loja da rede.', 500.00, 'vale-compra', 999, true, 'https://exemplo.com/vale-500.jpg');

-- Brindes
INSERT INTO products (name, description, points_cost, category, stock, active, image_url)
VALUES 
('Boné da Loja - Edição Limitada', 'Boné ajustável com logo bordado. 100% algodão.', 25.00, 'brinde', 200, true, 'https://exemplo.com/bone.jpg'),
('Camiseta Dry-Fit - Tamanho G', 'Camiseta esportiva com logo da loja. Tecido respirável.', 35.00, 'brinde', 150, true, 'https://exemplo.com/camiseta.jpg'),
('Garrafa Térmica 500ml', 'Garrafa de aço inox. Mantém temperatura por 12h.', 60.00, 'brinde', 80, true, 'https://exemplo.com/garrafa.jpg'),
('Chaveiro Multifuncional', 'Chaveiro com lanterna LED, chave phillips e abridor.', 15.00, 'brinde', 300, true, 'https://exemplo.com/chaveiro.jpg'),
('Mochila Porta-Ferramentas', 'Mochila resistente com múltiplos compartimentos.', 120.00, 'brinde', 45, true, 'https://exemplo.com/mochila.jpg');

-- ============================================
-- RESGATES (Histórico)
-- ============================================

-- João Silva (7742) - 3 resgates
INSERT INTO redemptions (customer_id, product_id, points_used, quantity, status, redeemed_at)
VALUES 
('7742', (SELECT id FROM products WHERE name = 'Vale-Compra R$ 50,00'), 50.00, 1, 'completed', '2026-02-05 16:25:00'),
('7742', (SELECT id FROM products WHERE name = 'Boné da Loja - Edição Limitada'), 25.00, 1, 'completed', '2026-01-20 11:15:00'),
('7742', (SELECT id FROM products WHERE name = 'Jogo de Chaves Phillips e Fenda'), 80.00, 1, 'completed', '2026-01-10 14:30:00');

-- Maria Santos (8851) - 2 resgates
INSERT INTO redemptions (customer_id, product_id, points_used, quantity, status, redeemed_at)
VALUES 
('8851', (SELECT id FROM products WHERE name = 'Camiseta Dry-Fit - Tamanho G'), 35.00, 1, 'completed', '2026-02-08 10:20:00'),
('8851', (SELECT id FROM products WHERE name = 'Garrafa Térmica 500ml'), 60.00, 1, 'completed', '2026-01-25 15:45:00');

-- Pedro Oliveira (9923) - 4 resgates
INSERT INTO redemptions (customer_id, product_id, points_used, quantity, status, redeemed_at)
VALUES 
('9923', (SELECT id FROM products WHERE name = 'Vale-Compra R$ 200,00'), 200.00, 1, 'completed', '2026-02-01 10:30:00'),
('9923', (SELECT id FROM products WHERE name = 'Furadeira de Impacto 500W'), 450.00, 1, 'completed', '2026-01-18 13:00:00'),
('9923', (SELECT id FROM products WHERE name = 'Parafusadeira Sem Fio 12V'), 350.00, 1, 'completed', '2026-01-05 16:20:00'),
('9923', (SELECT id FROM products WHERE name = 'Mochila Porta-Ferramentas'), 120.00, 1, 'completed', '2025-12-28 11:45:00');

-- Construções Silva (5501) - 2 resgates
INSERT INTO redemptions (customer_id, product_id, points_used, quantity, status, redeemed_at)
VALUES 
('5501', (SELECT id FROM products WHERE name = 'Vale-Compra R$ 500,00'), 500.00, 1, 'completed', '2026-02-02 11:20:00'),
('5501', (SELECT id FROM products WHERE name = 'Kit Ferramentas 100 Peças'), 420.00, 2, 'completed', '2026-01-14 09:30:00');

-- Ana Costa (3342) - 1 resgate
INSERT INTO redemptions (customer_id, product_id, points_used, quantity, status, redeemed_at)
VALUES 
('3342', (SELECT id FROM products WHERE name = 'Chaveiro Multifuncional'), 15.00, 2, 'completed', '2026-01-22 14:10:00');

-- ============================================
-- EVENTOS E PROMOÇÕES
-- ============================================

-- Eventos Ativos
INSERT INTO events (title, description, discount, start_date, end_date, active, image_url)
VALUES 
('Mega Queima de Estoque - Ferramentas', 'Descontos de até 50% em furadeiras, parafusadeiras, serras e muito mais! Estoque limitado.', 50.00, '2026-02-15', '2026-02-28', true, 'https://exemplo.com/evento-ferramentas.jpg'),
('Black February - Materiais Hidráulicos', 'Torneiras, chuveiros, registros e tubulações com até 40% OFF. Não perca!', 40.00, '2026-02-10', '2026-02-25', true, 'https://exemplo.com/evento-hidraulica.jpg'),
('Especial Tintas - Renove Sua Casa', 'Tintas premium com 35% de desconto. Todas as cores disponíveis.', 35.00, '2026-02-01', '2026-02-29', true, 'https://exemplo.com/evento-tintas.jpg');

-- Eventos Futuros
INSERT INTO events (title, description, discount, start_date, end_date, active, image_url)
VALUES 
('Semana do Cliente - Março', 'Descontos progressivos: quanto mais você compra, mais desconto ganha! Até 60% OFF.', 60.00, '2026-03-01', '2026-03-07', true, 'https://exemplo.com/evento-marco.jpg'),
('Aniversário da Loja - 25 Anos', 'Promoções imperdíveis durante todo o mês! Sorteios diários de brindes.', 25.00, '2026-04-01', '2026-04-30', true, 'https://exemplo.com/evento-aniversario.jpg');

-- Eventos Passados
INSERT INTO events (title, description, discount, start_date, end_date, active, image_url)
VALUES 
('Liquidação de Verão', 'Materiais para construção com até 30% de desconto. Evento encerrado.', 30.00, '2026-01-10', '2026-01-31', false, 'https://exemplo.com/evento-verao.jpg'),
('Natal das Ferramentas', 'Promoções especiais de fim de ano. Kits completos com desconto.', 45.00, '2025-12-15', '2025-12-31', false, 'https://exemplo.com/evento-natal.jpg');

-- ============================================
-- ESTATÍSTICAS COMPLETAS
-- ============================================

SELECT 'Script executado com sucesso!' as status;

-- Resumo
SELECT 
    (SELECT COUNT(*) FROM customers) as total_clientes,
    (SELECT COUNT(*) FROM products WHERE active = true) as total_produtos_ativos,
    (SELECT COUNT(*) FROM redemptions) as total_resgates,
    (SELECT COUNT(*) FROM events WHERE active = true) as total_eventos_ativos;