# 🏗️ Rewards Program — PWA de Fidelidade para Varejo

MVP de programa de fidelidade/cashback desenvolvido como projeto real em produção. Permite que clientes visualizem saldo de recompensas, histórico de transações, eventos e promoções, e recebam notificações push — tudo via PWA instalável em qualquer dispositivo.

> **Stack:** React 19 · TypeScript · Tailwind CSS v4 · FastAPI · PostgreSQL · Docker

**Demo em produção:** [rewards.strokes.dev.br](https://rewards.strokes.dev.br)  
**API docs (Swagger):** [api.rewards.strokes.dev.br/docs](https://api.rewards.strokes.dev.br/docs)

---

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Banco de Dados](#-banco-de-dados)
- [Rodando Localmente](#-rodando-localmente)
- [Deploy em Produção](#-deploy-em-produção)
- [Push Notifications (VAPID)](#-push-notifications-vapid)
- [Painel Admin](#-painel-admin)
- [API Reference](#-api-reference)
- [Frontend — Estrutura de Componentes](#-frontend--estrutura-de-componentes)
- [PWA — Instalação](#-pwa--instalação)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Decisões Técnicas](#-decisões-técnicas)

---

## ✅ Funcionalidades

| Feature | Status |
|---|---|
| Autenticação JWT (e-mail ou código do cliente) | ✅ |
| Visualização de saldo de cashback (R$) | ✅ |
| Histórico de transações com filtros avançados | ✅ |
| Detalhe de transação com itens da compra | ✅ |
| Eventos e promoções com carrossel | ✅ |
| Notificações in-app (sino) | ✅ |
| Push Notifications via Web Push API (VAPID) | ✅ |
| Painel admin para disparos de push | ✅ |
| Perfil editável (dados pessoais + endereço) | ✅ |
| PWA instalável (iOS, Android, Desktop) | ✅ |
| Suporte a CPF (PF) e CNPJ (PJ) | ✅ |

---

## 🏛️ Arquitetura

```
                        Cloudflare (DNS + Proxy)
                               │
                    ┌──────────┴──────────┐
                    │                     │
           rewards.strokes.dev.br   api.rewards.strokes.dev.br
                    │                     │
             Nginx Proxy Manager  ←→  Nginx Proxy Manager
                    │                     │
            ┌───────┴──────┐    ┌─────────┴────────┐
            │   Frontend   │    │     Backend       │
            │ nginx:alpine │    │  FastAPI (Python) │
            │  (porta 80)  │    │   (porta 8000)    │
            └──────────────┘    └─────────┬─────────┘
                                          │
                                ┌─────────┴─────────┐
                                │    PostgreSQL      │
                                │  (rede separada)   │
                                └───────────────────┘
```

**Redes Docker:**
- `proxy-network` — conecta frontend e backend ao Nginx Proxy Manager
- `database-network` — conecta backend ao PostgreSQL (isolado do frontend)

---

## 📁 Estrutura do Projeto

```
rewards/
├── backend/                        # FastAPI + Python
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py             # Injeção de dependências (get_db, get_current_customer)
│   │   │   └── v1/
│   │   │       ├── __init__.py     # Registro de todos os routers
│   │   │       ├── auth.py         # POST /auth/login, GET /auth/me
│   │   │       ├── customers.py    # GET/PATCH /customers/me, GET /customers/me/stats
│   │   │       ├── transactions.py # GET /transactions
│   │   │       ├── notifications.py# GET /notifications, PATCH mark-read
│   │   │       ├── products.py     # GET /products
│   │   │       ├── events.py       # GET /events
│   │   │       └── push.py         # Push notifications (subscribe, send, broadcast)
│   │   ├── core/
│   │   │   ├── config.py           # Settings (pydantic-settings, lê do .env)
│   │   │   ├── database.py         # SQLAlchemy engine + SessionLocal
│   │   │   ├── security.py         # JWT, bcrypt (verify_password, create_access_token)
│   │   │   └── push.py             # Serviço Web Push (pywebpush + limpeza de subs)
│   │   ├── models/
│   │   │   ├── __init__.py         # Exporta todos os models
│   │   │   ├── customer.py         # Tabela customers
│   │   │   ├── address.py          # Tabela addresses
│   │   │   ├── transaction.py      # Tabela transactions
│   │   │   ├── transaction_item.py # Tabela transaction_items
│   │   │   ├── notification.py     # Tabela notifications
│   │   │   ├── push_subscription.py# Tabela push_subscriptions
│   │   │   ├── product.py          # Tabela products
│   │   │   ├── redemption.py       # Tabela redemptions
│   │   │   └── event.py            # Tabela events
│   │   ├── schemas/
│   │   │   ├── __init__.py         # Exporta todos os schemas
│   │   │   ├── auth.py             # Token, TokenData
│   │   │   ├── customer.py         # CustomerResponse, CustomerUpdate, CustomerStats
│   │   │   ├── notification.py     # NotificationResponse, NotificationMarkRead
│   │   │   ├── push.py             # PushSubscribeRequest, PushSendRequest, etc.
│   │   │   └── ...                 # products, events, transactions
│   │   └── main.py                 # App FastAPI, CORS, health check, routers
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                       # React + TypeScript + Vite
│   ├── public/
│   │   ├── admin.html              # Painel admin de push (HTML estático, sem build)
│   │   ├── logo.svg
│   │   ├── pwa-192x192.png
│   │   └── pwa-512x512.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── BalanceCard.tsx         # Card de saldo na home
│   │   │   ├── TransactionList.tsx     # Lista de transações
│   │   │   ├── TransactionDetailModal.tsx # Modal com detalhes + itens da compra
│   │   │   ├── FilterModal.tsx         # Modal de filtros do extrato
│   │   │   ├── NotificationBell.tsx    # Sino com badge de não lidas
│   │   │   ├── NotificationModal.tsx   # Modal com lista de notificações
│   │   │   └── PromotionDetailModal.tsx# Modal de detalhe de promoção
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx         # JWT: login, logout, isAuthenticated
│   │   ├── hooks/
│   │   │   ├── useCustomer.ts          # GET /customers/me
│   │   │   ├── useStats.ts             # GET /customers/me/stats
│   │   │   ├── useTransactions.ts      # GET /transactions
│   │   │   ├── useNotifications.ts     # GET /notifications + mark-read
│   │   │   ├── useEvents.ts            # GET /events (mapeia para Campaign/Promotion)
│   │   │   └── usePushNotifications.ts # Web Push: permissão, subscribe, unsubscribe
│   │   ├── lib/
│   │   │   └── api-client.ts           # Wrapper de fetch com JWT + ApiError
│   │   ├── types/
│   │   │   └── index.ts                # Interfaces TypeScript: Customer, Transaction...
│   │   ├── views/
│   │   │   ├── LoginView.tsx
│   │   │   ├── HomeView.tsx            # Saldo + transações recentes
│   │   │   ├── HistoryView.tsx         # Extrato completo com filtros
│   │   │   ├── EventsView.tsx          # Carrossel + lista de promoções
│   │   │   ├── ProfileView.tsx         # Dados pessoais + push opt-in/out
│   │   │   ├── HelpCenterView.tsx
│   │   │   ├── TermsView.tsx
│   │   │   └── PrivacyView.tsx
│   │   ├── App.tsx                     # Roteamento por estado (ActivePage), bottom nav
│   │   ├── main.tsx
│   │   ├── sw.ts                       # Service Worker (Workbox + push handler)
│   │   └── index.css                   # Tailwind v4 + CSS custom properties + animações
│   ├── nginx.conf                      # Config Nginx: SPA routing + cache de assets
│   ├── Dockerfile                      # Multi-stage: node build → nginx serve
│   ├── vite.config.ts                  # Vite + React SWC + VitePWA (injectManifest)
│   └── package.json
│
├── database/
│   ├── schema/
│   │   └── init.sql                    # Schema base completo (criar do zero)
│   ├── seeds/
│   │   └── seed_data.sql               # Dados mock para desenvolvimento
│   └── migrations/
│       ├── 001_add_products_events_redemptions.sql
│       ├── 002_add_transaction_items.sql
│       └── 003_add_push_subscriptions.sql
│
├── docker-compose.yml
├── .env.example                        # Template de variáveis (NUNCA commitar o .env)
└── .gitignore
```

---

## 🛠️ Pré-requisitos

| Ferramenta | Versão mínima | Para que serve |
|---|---|---|
| Docker | 24+ | Containers de produção e desenvolvimento |
| Docker Compose | v2.20+ | Orquestração dos serviços |
| Node.js | 20+ | Build do frontend (apenas local) |
| Python | 3.12+ | Backend (apenas se rodar fora do Docker) |
| PostgreSQL | 14+ | Banco de dados (pode ser instância externa) |

> Em produção, apenas Docker e Docker Compose são obrigatórios. O PostgreSQL está em um container separado compartilhado na VPS.

---

## ⚙️ Configuração do Ambiente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/rewards.git
cd rewards
```

### 2. Crie o arquivo `.env`

```bash
cp .env.example .env
nano .env
```

Preencha **todas** as variáveis. Veja a seção [Variáveis de Ambiente](#-variáveis-de-ambiente) para detalhes de cada uma.

### 3. Gere as chaves VAPID (obrigatório para push notifications)

```bash
pip install py_vapid cryptography
python3 -c "
from py_vapid import Vapid
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat, PrivateFormat, NoEncryption
import base64

v = Vapid()
v.generate_keys()

private = base64.urlsafe_b64encode(
    v.private_key.private_bytes(Encoding.DER, PrivateFormat.PKCS8, NoEncryption())
).decode().rstrip('=')

public = base64.urlsafe_b64encode(
    v.public_key.public_bytes(Encoding.X962, PublicFormat.UncompressedPoint)
).decode().rstrip('=')

print('VAPID_PRIVATE_KEY=' + private)
print('VAPID_PUBLIC_KEY=' + public)
"
```

Cole os valores no `.env`.

### 4. Gere uma SECRET_KEY segura

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 5. Gere o PUSH_ADMIN_SECRET

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🗄️ Banco de Dados

### Estrutura das tabelas

```
customers          — Clientes (CPF ou CNPJ)
  └── addresses    — Endereços (um primário por cliente)
  └── transactions — Transações de cashback
        └── transaction_items — Itens da compra
  └── notifications — Notificações in-app
  └── push_subscriptions — Subscriptions Web Push por dispositivo
  └── redemptions  — Histórico de resgates (futuro)

products           — Catálogo de produtos para resgate (futuro)
events             — Eventos e promoções
```

### Inicialização do banco do zero

**Pré-requisito:** ter o PostgreSQL rodando e acessível. O `DATABASE_URL` no `.env` deve apontar para ele.

#### Opção A — Via Docker (recomendado para desenvolvimento)

```bash
# Sobe apenas o backend (que tem acesso ao banco)
docker compose up -d backend

# Executa o schema base
docker exec -i rewards_backend psql "$DATABASE_URL" < database/schema/init.sql

# Popula com dados mock (desenvolvimento)
docker exec -i rewards_backend psql "$DATABASE_URL" < database/seeds/seed_data.sql

# Aplica as migrações
docker exec -i rewards_backend psql "$DATABASE_URL" < database/migrations/001_add_products_events_redemptions.sql
docker exec -i rewards_backend psql "$DATABASE_URL" < database/migrations/002_add_transaction_items.sql
```

> A migração 003 (`push_subscriptions`) é criada automaticamente pelo SQLAlchemy no primeiro `docker compose up`. O arquivo `.sql` existe apenas como documentação histórica.

#### Opção B — Criação automática via SQLAlchemy

O backend cria as tabelas automaticamente ao iniciar, desde que a extensão `uuid-ossp` já exista no banco:

```bash
# No psql, como superusuário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Depois suba o backend normalmente:

```bash
docker compose up -d backend
```

#### Verificar se as tabelas foram criadas

```bash
docker exec -it rewards_backend python3 -c "
from app.core.database import engine
from sqlalchemy import inspect
tables = inspect(engine).get_table_names()
print('Tabelas criadas:', tables)
"
```

### Usuários mock para testes

Após rodar o `seed_data.sql`, os seguintes usuários estarão disponíveis:

| Código | Nome | Senha | Tipo |
|---|---|---|---|
| `7742` | João Silva | `tmx` | CPF |
| `8851` | Maria Santos | `tmx` | CPF |
| `9923` | Pedro Oliveira | `tmx` | CPF |
| `5501` | Construções Silva Ltda | `tmx` | CNPJ |
| `3342` | Ana Costa | `tmx` | CPF |

O login aceita tanto o código numérico quanto o e-mail cadastrado.

### Migrações

As migrações são scripts SQL manuais (sem Alembic no MVP). O histórico está em `database/migrations/`:

| Arquivo | Descrição |
|---|---|
| `001_add_products_events_redemptions.sql` | Tabelas `products`, `events`, `redemptions` + dados mock |
| `002_add_transaction_items.sql` | Tabela `transaction_items` + dados mock de itens |
| `003_add_push_subscriptions.sql` | Tabela `push_subscriptions` (documentação — criada pelo SQLAlchemy) |

---

## 💻 Rodando Localmente

### Backend + Frontend com Docker Compose

```bash
docker compose up -d --build
```

- Frontend: `http://localhost` (ou a porta do proxy)
- Backend: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### Frontend em modo de desenvolvimento (hot reload)

```bash
cd frontend
npm install
npm run dev
# Disponível em http://localhost:5173
```

> Certifique-se de que o `VITE_API_URL` no `.env` aponta para o backend correto.

### Backend com uvicorn diretamente

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 🚀 Deploy em Produção

O projeto usa **Nginx Proxy Manager** como reverse proxy na VPS com SSL automático via Let's Encrypt e **Cloudflare** para DNS.

### Estrutura de redes Docker

As redes `proxy-network` e `database-network` devem existir antes do deploy:

```bash
docker network create proxy-network
docker network create database-network
```

### Deploy completo

```bash
# Na VPS, dentro de /opt/containers/rewards
git pull origin main
docker compose up -d --build
```

### Deploy apenas de um serviço

```bash
# Apenas backend
docker compose up -d --build backend

# Apenas frontend
docker compose up -d --build frontend
```

### Configuração do Nginx Proxy Manager

Crie dois **Proxy Hosts**:

| Domain | Forward Hostname | Forward Port |
|---|---|---|
| `rewards.strokes.dev.br` | `rewards_frontend` | `80` |
| `api.rewards.strokes.dev.br` | `rewards_backend` | `8000` |

Ative SSL em ambos (Let's Encrypt) e force HTTPS.

---

## 🔔 Push Notifications (VAPID)

O sistema usa **Web Push API** com VAPID — sem dependência de serviços externos (OneSignal, Firebase, etc.). O mesmo código funciona em iOS Safari (16.4+), Android Chrome/Firefox e navegadores desktop.

### Fluxo completo

```
1. Cliente abre o PWA e acessa Perfil → ativa notificações
2. Frontend solicita permissão ao navegador
3. Busca a VAPID_PUBLIC_KEY em GET /push/vapid-public-key
4. Cria PushSubscription no navegador
5. Envia para POST /push/subscribe (requer JWT)
6. Backend salva em push_subscriptions no PostgreSQL

7. Admin acessa /admin.html → envia push
8. Backend usa pywebpush → envia para Apple APNs / Mozilla Push / Google FCM
9. Dispositivo recebe push mesmo com app fechado
10. Clique na notificação → Service Worker abre o app
```

### Gerando as chaves VAPID

Veja a seção [Configuração do Ambiente](#-configuração-do-ambiente), passo 3.

As chaves são geradas **uma única vez** e nunca devem ser rotacionadas (isso invalidaria todas as subscriptions existentes).

### Testando via curl

```bash
# Enviar para um cliente específico
curl -X POST https://api.rewards.strokes.dev.br/api/v1/push/send \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: SEU_PUSH_ADMIN_SECRET" \
  -d '{
    "customer_id": "7742",
    "title": "🎉 Promoção especial!",
    "message": "Cimento com 20% OFF hoje!",
    "url": "/"
  }'

# Broadcast para todos os clientes
curl -X POST https://api.rewards.strokes.dev.br/api/v1/push/broadcast \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: SEU_PUSH_ADMIN_SECRET" \
  -d '{
    "title": "📢 Novidades na loja!",
    "message": "Confira os novos eventos e promoções.",
    "url": "/"
  }'
```

### Resposta esperada

```json
{
  "message": "Push enviado",
  "sent": 2,
  "failed": 0,
  "removed": 0
}
```

> `removed` indica subscriptions expiradas que foram automaticamente limpas do banco.

---

## 🛡️ Painel Admin

Disponível em `/admin.html` (arquivo estático, sem autenticação de usuário — acesso por senha secreta).

**URL:** `https://rewards.strokes.dev.br/admin.html`

**Senha:** valor de `PUSH_ADMIN_SECRET` no `.env`

### Funcionalidades

- **Aba Individual** — enviar push para um cliente específico pelo código (ex: `7742`)
- **Aba Broadcast** — enviar para todos os clientes com notificações ativas
- Auto-login: a senha é salva no `localStorage` do navegador após o primeiro acesso
- Feedback visual com contagem de dispositivos alcançados

---

## 📡 API Reference

Base URL: `https://api.rewards.strokes.dev.br/api/v1`

Documentação interativa completa: `/docs` (Swagger UI)

### Autenticação

Todos os endpoints (exceto `/auth/login` e `/push/vapid-public-key`) requerem:
```
Authorization: Bearer <JWT_TOKEN>
```

O token expira em 24 horas (configurável via `ACCESS_TOKEN_EXPIRE_MINUTES`).

### Endpoints principais

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/auth/login` | ❌ | Login com e-mail/código + senha |
| GET | `/auth/me` | JWT | Dados do usuário autenticado |
| GET | `/customers/me` | JWT | Perfil completo do cliente |
| PATCH | `/customers/me` | JWT | Atualizar dados do perfil |
| GET | `/customers/me/stats` | JWT | Estatísticas (total acumulado, resgatado) |
| GET | `/transactions` | JWT | Histórico de transações com itens |
| GET | `/notifications` | JWT | Notificações do cliente |
| PATCH | `/notifications/mark-read` | JWT | Marcar como lidas |
| PATCH | `/notifications/mark-all-read` | JWT | Marcar todas como lidas |
| GET | `/events` | JWT | Eventos e promoções ativos |
| GET | `/products` | JWT | Catálogo de produtos para resgate |
| GET | `/push/vapid-public-key` | ❌ | Chave pública VAPID |
| POST | `/push/subscribe` | JWT | Registrar subscription do dispositivo |
| DELETE | `/push/unsubscribe` | JWT | Remover subscription |
| POST | `/push/send` | Admin Secret | Enviar push para cliente |
| POST | `/push/broadcast` | Admin Secret | Enviar push para todos |

O **Admin Secret** é passado via header: `X-Admin-Secret: <PUSH_ADMIN_SECRET>`

---

## 🎨 Frontend — Estrutura de Componentes

### Roteamento

O app usa **roteamento por estado** (`useState<ActivePage>`) em vez de React Router — simples e eficiente para um SPA mobile-first:

```typescript
type ActivePage = 'inicio' | 'extrato' | 'eventos' | 'perfil' | 'ajuda' | 'termos' | 'privacidade'
```

### Fluxo de dados

```
App.tsx
  ├── useCustomer()     → GET /customers/me
  ├── useTransactions() → GET /transactions
  ├── useStats()        → GET /customers/me/stats
  │     ↓ merge em customerWithStats (useMemo)
  ├── HomeView    ← customer + transactions
  ├── HistoryView ← transactions (filtros locais via useMemo)
  ├── EventsView  ← useEvents() → GET /events
  └── ProfileView ← customer + usePushNotifications()
```

### Service Worker

O Service Worker (`src/sw.ts`) usa **Workbox com injectManifest** para:
- Precaching de todos os assets do build (via `self.__WB_MANIFEST`)
- Limpeza de caches desatualizados
- Handler de `push` events (notificações)
- Handler de `notificationclick` (navegação ao clicar)

O registro é automático via `vite-plugin-pwa` com `registerType: 'autoUpdate'`.

---

## 📱 PWA — Instalação

### iOS (Safari)

1. Abra `rewards.strokes.dev.br` no Safari
2. Toque no botão de compartilhar (⬆️)
3. Selecione **"Adicionar à Tela de Início"**
4. Confirme o nome e toque em **Adicionar**

> Push notifications requerem iOS 16.4+ e que o app seja instalado como PWA.

### Android (Chrome)

1. Abra o site no Chrome
2. Toque nos três pontos (⋮) → **"Adicionar à tela inicial"**
3. Ou aguarde o banner de instalação aparecer automaticamente

### Desktop (Chrome/Edge)

1. Acesse o site
2. Clique no ícone de instalação na barra de endereços (➕)
3. Clique em **Instalar**

---

## 🔐 Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```bash
# ── Banco de Dados ──────────────────────────────────────────────────────────
# Formato: postgresql+psycopg://usuario:senha@host:porta/banco
DATABASE_URL=postgresql+psycopg://dbuser:SENHA@postgres:5432/rewards_db

# ── Segurança JWT ───────────────────────────────────────────────────────────
# Gerar com: python3 -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=CHAVE_FORTE_AQUI
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440   # 24 horas

# ── CORS ────────────────────────────────────────────────────────────────────
# Em produção, apenas o domínio do frontend
CORS_ORIGINS=["https://rewards.strokes.dev.br"]

# ── API ─────────────────────────────────────────────────────────────────────
API_V1_PREFIX=/api/v1

# ── Push Notifications (VAPID) ──────────────────────────────────────────────
# Gerar conforme instruções em "Configuração do Ambiente"
VAPID_PRIVATE_KEY=CHAVE_PRIVADA_BASE64
VAPID_PUBLIC_KEY=CHAVE_PUBLICA_BASE64
VAPID_ADMIN_EMAIL=admin@seudominio.com.br
# Gerar com: python3 -c "import secrets; print(secrets.token_urlsafe(32))"
PUSH_ADMIN_SECRET=SENHA_FORTE_AQUI

# ── Frontend (build arg do Docker) ──────────────────────────────────────────
VITE_API_URL=https://api.rewards.strokes.dev.br/api/v1
```

> ⚠️ O arquivo `.env` está no `.gitignore` e **nunca deve ser commitado**. Apenas o `.env.example` vai para o repositório.

---

## 🧠 Decisões Técnicas

### Por que roteamento por estado em vez de React Router?

Para um PWA mobile-first com uma única tela visível por vez e bottom nav, o gerenciamento via `useState<ActivePage>` é mais simples, sem overhead de configuração e funciona perfeitamente com as animações de transição de página.

### Por que Tailwind CSS v4?

Engine completamente nova (Rust/Lightning CSS), sem arquivo de configuração obrigatório, tempos de build até 5× menores. As classes utility-first eliminam a necessidade de bibliotecas de UI complexas (MUI, Chakra), mantendo o bundle enxuto.

### Por que Web Push com VAPID em vez de Firebase/OneSignal?

Zero custo, zero dependência externa, dados ficam no seu banco, mesmo código funciona em todos os browsers. A única limitação é iOS 16.4+ — mas o app já era PWA-only.

### Por que bcrypt==4.0.1 fixado?

Python 3.14 quebrou compatibilidade com versões mais recentes do bcrypt via `passlib`. A versão 4.0.1 é a última com suporte estável nessa combinação.

### Por que não Alembic para migrações?

MVP com esquema estável. Scripts SQL manuais em `database/migrations/` são mais simples de entender, revisar e executar. Alembic faz sentido quando o schema evolui frequentemente com múltiplos developers.

### Por que `injectManifest` em vez de `generateSW`?

O `generateSW` gera um Service Worker automático sem suporte a handlers customizados. O `injectManifest` permite controlar o SW completamente — necessário para o handler de `push events` das notificações.

---

## 📦 Versões das dependências principais

### Backend
| Pacote | Versão |
|---|---|
| Python | 3.12 |
| FastAPI | 0.115.6 |
| SQLAlchemy | 2.0.36 |
| Pydantic | 2.12.5 |
| psycopg | 3.3.3 |
| pywebpush | 2.0.0 |
| bcrypt | 4.0.1 |
| uvicorn | 0.34.0 |

### Frontend
| Pacote | Versão |
|---|---|
| React | 19.2.0 |
| TypeScript | 5.9.x |
| Vite | 7.x |
| Tailwind CSS | 4.1.x |
| vite-plugin-pwa | 1.2.0 |
| lucide-react | 0.563.0 |

---

## 📝 Licença

Projeto privado desenvolvido para fins profissionais e educacionais. Joinville, SC — 2026.