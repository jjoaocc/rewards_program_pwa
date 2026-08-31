# 🏗️ Rewards Program, PWA de Fidelidade para Varejo

Programa de fidelidade/cashback rodando em produção real. Clientes acompanham saldo de recompensas, histórico de transações, eventos/promoções e recebem notificações push, tudo via PWA instalável em qualquer dispositivo. Inclui um painel administrativo separado para disparo de notificações.

> **Stack:** React 19 · TypeScript · Tailwind CSS v4 · FastAPI · PostgreSQL · Docker

**App:** [rewards.strokes.dev.br](https://rewards.strokes.dev.br)
**Painel admin:** [rewards.strokes.dev.br/admin](https://rewards.strokes.dev.br/admin)
**API docs (Swagger):** [api.strokes.dev.br/rewards/docs](https://api.strokes.dev.br/rewards/docs)

---

## 💡 Sobre o projeto

Este é um projeto pessoal, construído do zero como programa de fidelidade completo (não é um bootcamp/tutorial), usado de verdade pelo autor no dia a dia. Serve tanto como aplicação real quanto como material de portfólio/estudo, por isso o cuidado extra com arquitetura, testes e automação, não é só "fazer funcionar", é praticar como um projeto profissional seria construído e mantido:

- **Arquitetura hexagonal** no backend (domain → ports → adapters → application), TDD como prática padrão, não only-in-theory.
- **CI/CD real**: todo push roda lint, checagem de tipos, análise estática de segurança, auditoria de dependências e a suíte de testes completa; o deploy só acontece se tudo passar.
- **Frontend com portas injetáveis** (o mesmo princípio de inversão de dependência do backend, aplicado no React) e validação de contrato em runtime (zod) contra a API real.

Veja [Arquitetura](#-arquitetura) e [Decisões Técnicas](#-decisões-técnicas) para o raciocínio por trás de cada escolha.

---

## 📋 Índice

- [Sobre o projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Segurança](#-segurança)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Banco de Dados](#-banco-de-dados)
- [Testes](#-testes)
- [CI/CD](#-cicd)
- [Rodando Localmente](#-rodando-localmente)
- [Deploy em Produção](#-deploy-em-produção)
- [Push Notifications (VAPID)](#-push-notifications-vapid)
- [Painel Admin](#-painel-admin)
- [API Reference](#-api-reference)
- [Frontend, Estrutura e Padrões](#-frontend-estrutura-e-padrões)
- [PWA, Instalação](#-pwa-instalação)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Decisões Técnicas](#-decisões-técnicas)

---

## ✅ Funcionalidades

| Feature | Status |
|---|---|
| Autenticação JWT (e-mail ou código do cliente) | ✅ |
| Visualização de saldo de cashback (R$) | ✅ |
| Histórico de transações com filtros + paginação ("carregar mais") | ✅ |
| Detalhe de transação com itens da compra | ✅ |
| Eventos e promoções com carrossel | ✅ |
| Notificações in-app (sino), com marcação de lida e remoção | ✅ |
| Push Notifications via Web Push API (VAPID) | ✅ |
| Painel admin (app React próprio), individual, seleção múltipla, broadcast e histórico de envios | ✅ |
| Perfil editável (dados pessoais, e-mail principal/secundário, endereço) | ✅ |
| PWA instalável (iOS, Android, Desktop) | ✅ |
| Suporte a CPF (PF) e CNPJ (PJ) | ✅ |

---

## 🏛️ Arquitetura

```
                              Cloudflare (DNS + Proxy)
                                     │
                    ┌────────────────┴─────────────────┐
                    │                                   │
           rewards.strokes.dev.br              api.strokes.dev.br
                    │                        (compartilhado entre projetos)
                    │                                   │
             Nginx Proxy Manager                 Nginx Proxy Manager
                    │                       Custom Location /rewards/
                    │                    (encaminha removendo o prefixo)
            ┌───────┴──────┐                            │
            │   Frontend   │                  ┌─────────┴────────┐
            │ nginx:alpine │                  │     Backend       │
            │  (porta 80)  │                  │  FastAPI (Python) │
            └──────────────┘                  │   (porta 8000)    │
                                               └─────────┬─────────┘
                                                         │
                                               ┌─────────┴─────────┐
                                               │    PostgreSQL      │
                                               │  (rede separada)   │
                                               └───────────────────┘
```

**Redes Docker:**
- `proxy-network`, conecta frontend e backend ao Nginx Proxy Manager. Nenhum dos dois containers publica porta no host, só é alcançável via essa rede.
- `database-network`, conecta backend ao PostgreSQL (isolado do frontend).

O frontend é servido em `rewards.strokes.dev.br` (subdomínio próprio). O backend fica atrás de `api.strokes.dev.br`, um domínio compartilhado com outros projetos na mesma VPS, roteado por path (`/rewards/`) via Custom Location do Nginx Proxy Manager, o backend usa `ROOT_PATH` só para o Swagger/OpenAPI gerar os links públicos corretos.

### Backend, hexagonal (ports & adapters)

Cada domínio (customer, transaction, notification, product, event, push, auth) segue o mesmo fluxo, de dentro pra fora:

```
domain/        → entidades puras (dataclasses), zero SQLAlchemy/Pydantic/I-O
ports/         → Protocols, o contrato que a aplicação depende (ex: CustomerRepository)
adapters/db/   → implementação concreta dos ports com SQLAlchemy
application/   → casos de uso, orquestram domain + ports, não conhecem HTTP nem SQL
api/v1/        → routers FastAPI, só tratam requisição/resposta HTTP
```

A regra de dependência é sempre pra dentro: `api` depende de `application`, que depende de `ports` (nunca de `adapters` diretamente), a injeção do adapter concreto acontece só em `api/deps.py` (composition root). Isso permite testar `application/` inteiro com **fakes** em memória (`tests/fakes/`), sem precisar de banco, e reservar os testes com Postgres real (`tests/integration/`) pra validar só o mapeamento SQL ↔ domínio.

---

## 🔐 Segurança

- **Autenticação de cliente**: JWT (PyJWT) com `sub` = ID do cliente, expiração configurável (`ACCESS_TOKEN_EXPIRE_MINUTES`). Senhas com `bcrypt` puro (sem passlib).
- **Rate limiting** (`slowapi`): 5/min em `/auth/login`, 5/min em `/push/admin/login`, 10/min nos envios de push admin. A chave de limite usa o primeiro IP de `X-Forwarded-For`, não `request.client.host`, necessário porque o backend só é alcançável via o proxy (Nginx Proxy Manager), então o IP de conexão direta seria sempre o do proxy, não o do cliente real.
- **Security headers**: middleware próprio (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) e uma Content-Security-Policy restritiva (`default-src 'self'`) em ambas as camadas (FastAPI e Nginx do frontend), os endpoints de documentação (`/docs`, `/redoc`) ficam isentos da CSP mais estrita.
- **Painel admin**: autenticação por secret (`PUSH_ADMIN_SECRET`), mas o painel nunca guarda esse secret no navegador, troca ele por um token de sessão de curta duração (JWT, 12h, `POST /push/admin/login`) e usa esse token (`Authorization: Bearer`) nas chamadas seguintes. O header `X-Admin-Secret` continua aceito como alternativa (scripts/automação).
- **Paginação com teto**: todos os endpoints de listagem (`/transactions`, `/notifications`, `/products`) têm um limite máximo de itens por página, mesmo que o cliente peça mais.

---

## 📁 Estrutura do Projeto

```
rewards/
├── backend/                            # FastAPI + Python 3.12
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py                 # get_db, get_current_customer (JWT)
│   │   │   └── v1/
│   │   │       ├── __init__.py         # Registro de todos os routers
│   │   │       ├── auth.py             # login, logout, me
│   │   │       ├── customers.py        # perfil e estatísticas
│   │   │       ├── transactions.py     # histórico paginado
│   │   │       ├── notifications.py    # listar, marcar lida, deletar
│   │   │       ├── products.py         # catálogo (filtros)
│   │   │       ├── events.py           # eventos/promoções
│   │   │       └── push.py             # subscribe + endpoints do painel admin
│   │   ├── core/
│   │   │   ├── config.py               # Settings (pydantic-settings), get_settings() c/ lru_cache
│   │   │   ├── database.py             # engine + SessionLocal
│   │   │   ├── security.py             # JWT (cliente e admin), bcrypt
│   │   │   ├── security_headers.py     # middleware de headers + CSP
│   │   │   ├── limiter.py              # slowapi, key_func por X-Forwarded-For
│   │   │   ├── pagination.py           # MAX_PAGE_SIZE compartilhado
│   │   │   └── push.py                 # envio via pywebpush (porta WebPushSender injetável)
│   │   ├── domain/                     # entidades puras (dataclasses), um arquivo por domínio
│   │   ├── ports/                      # Protocols, contratos que application depende
│   │   ├── adapters/db/                # implementação SQLAlchemy dos ports
│   │   ├── application/                # casos de uso (product_use_cases.py, push_use_cases.py...)
│   │   ├── models/                     # SQLAlchemy, um arquivo por tabela (Mapped[]/mapped_column)
│   │   ├── schemas/                    # Pydantic, request/response por domínio
│   │   └── main.py                     # App FastAPI, middlewares, health check, routers
│   ├── tests/
│   │   ├── unit/application/           # casos de uso com fakes em memória, sem banco
│   │   ├── integration/adapters/       # adapters SQLAlchemy contra Postgres real (testcontainers)
│   │   ├── fakes/                      # implementações fake dos ports (não mocks)
│   │   └── test_*.py                   # contrato HTTP completo, via TestClient + Postgres real
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── pyproject.toml                  # ruff, mypy, bandit, pytest
│
├── frontend/                           # React 19 + TypeScript + Vite
│   ├── public/                         # ícones, manifest, favicons
│   ├── src/
│   │   ├── admin/                      # app React separado do painel admin (build multi-page)
│   │   │   ├── components/             # LoginScreen, abas (Individual/Selected/Broadcast/History)...
│   │   │   ├── hooks/                  # useAdminAuth, useCustomerSearch, useCampaignHistory...
│   │   │   ├── lib/                    # admin-api-client (fetch com Bearer token)
│   │   │   ├── AdminApp.tsx
│   │   │   └── main.tsx
│   │   ├── components/                 # componentes de UI compartilhados
│   │   │   └── profile/                # seções da tela de Perfil
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx         # JWT: login, logout, isAuthenticated
│   │   ├── hooks/                      # um hook por recurso da API (useCustomer, useTransactions...)
│   │   ├── lib/
│   │   │   ├── api-client.ts           # fetch com JWT + ApiError (porta injetável)
│   │   │   ├── api-error.ts            # helper compartilhado de mensagem de erro
│   │   │   └── format.ts               # formatação de moeda/data (parsing seguro de timezone)
│   │   ├── types/
│   │   │   └── index.ts                # interfaces TypeScript do domínio
│   │   ├── views/                      # uma tela por rota (Home, Extrato, Eventos, Perfil...)
│   │   ├── App.tsx                     # roteamento por estado (ActivePage), bottom nav
│   │   ├── main.tsx
│   │   ├── sw.ts                       # Service Worker (Workbox + handler de push)
│   │   └── index.css                   # Tailwind v4 + design tokens + animações
│   ├── admin.html                      # entry point do painel admin (Vite multi-page)
│   ├── index.html                      # entry point do app principal
│   ├── nginx.conf                      # SPA routing, cache de assets, CSP
│   ├── Dockerfile                      # multi-stage: node build → nginx serve
│   ├── vite.config.ts                  # multi-page build, PWA (injectManifest), vitest
│   └── package.json
│
├── database/
│   ├── schema/init.sql                 # schema base completo (criar do zero)
│   ├── seeds/seed_data.sql             # dados mock para desenvolvimento
│   └── migrations/                     # scripts SQL sequenciais (sem Alembic)
│
├── docker-compose.yml
├── .env.example                        # template de variáveis (NUNCA commitar o .env)
├── .gitignore
├── backend/.dockerignore
└── frontend/.dockerignore
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
git clone <url-do-seu-repositorio>
cd rewards
```

### 2. Crie o arquivo `.env`

```bash
cp .env.example .env
nano .env
```

Preencha **todas** as variáveis. Veja [Variáveis de Ambiente](#-variáveis-de-ambiente).

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

Cole os valores no `.env`. As chaves são geradas **uma única vez**, rotacioná-las invalida todas as subscriptions existentes.

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
customers             clientes (CPF ou CNPJ), com e-mail principal e secundário
  └── addresses        endereços (um primário por cliente)
  └── transactions     transações de cashback
        └── transaction_items   itens da compra
  └── notifications    notificações in-app
  └── push_subscriptions   subscriptions Web Push por dispositivo

products               catálogo de produtos para resgate
events                 eventos e promoções
push_campaigns         histórico de envios do painel admin (individual/seleção/broadcast)
```

### Inicialização do banco do zero

**Pré-requisito:** ter o PostgreSQL rodando e acessível, com a extensão `uuid-ossp` habilitada. O `DATABASE_URL` no `.env` deve apontar para ele.

```bash
# No psql, como superusuário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

```bash
# Sobe apenas o backend (que tem acesso ao banco)
docker compose up -d backend

# Executa o schema base
docker exec -i rewards_backend psql "$DATABASE_URL" < database/schema/init.sql

# Popula com dados mock (desenvolvimento)
docker exec -i rewards_backend psql "$DATABASE_URL" < database/seeds/seed_data.sql

# Aplica as migrações em ordem
for f in database/migrations/*.sql; do
  docker exec -i rewards_backend psql "$DATABASE_URL" < "$f"
done
```

> Não há um runner de migração automático (nem Alembic), cada arquivo em `database/migrations/` é aplicado manualmente, uma vez, na ordem numérica.

#### Verificar se as tabelas foram criadas

```bash
docker exec -it rewards_backend python3 -c "
from app.core.database import engine
from sqlalchemy import inspect
print('Tabelas:', inspect(engine).get_table_names())
"
```

### Usuários mock para testes

Após rodar o `seed_data.sql`, os seguintes usuários estarão disponíveis (senha `tmx` para todos):

| Código | Nome | Tipo |
|---|---|---|
| `7742` | João Silva | CPF |
| `8851` | Maria Santos | CPF |
| `9923` | Pedro Oliveira | CPF |
| `5501` | Construções Silva Ltda | CNPJ |
| `3342` | Ana Costa | CPF |

O login aceita tanto o código numérico quanto o e-mail cadastrado.

### Migrações

| Arquivo | Descrição |
|---|---|
| `001_add_products_events_redemptions.sql` | Tabelas `products`, `events` + dados mock |
| `002_add_transaction_items.sql` | Tabela `transaction_items` + dados mock de itens |
| `003_add_push_subscriptions.sql` | Tabela `push_subscriptions` (documentação, criada pelo SQLAlchemy) |
| `004_remove_redemptions.sql` | Remove a tabela de resgates (feature nunca teve endpoint na API) |
| `005_add_customer_secondary_email.sql` | Coluna `secondary_email` em `customers` |
| `006_add_push_campaigns.sql` | Tabela `push_campaigns` (histórico de envios do painel admin) |

---

## 🧪 Testes

### Backend, pytest + testcontainers

Sobe um PostgreSQL efêmero em container pra rodar a suíte, sem precisar de um banco local configurado:

```bash
cd backend
pip install -r requirements.txt -r requirements-dev.txt
pytest -v --cov=app
```

181 testes, cobertura ~99%, divididos em 3 camadas: casos de uso com fakes em memória (`tests/unit/`, sem banco), adapters contra Postgres real (`tests/integration/`) e contrato HTTP completo via `TestClient` (`tests/test_*.py`, também contra Postgres real). Cada teste roda numa transação com savepoint que é revertida ao final (isolamento rápido, sem recriar o schema a cada teste).

Lint, tipos e segurança:

```bash
ruff check .                          # lint
mypy app/                             # checagem de tipos estática
bandit -r app/                        # análise de segurança estática
pip-audit -r requirements.txt         # CVE conhecidos nas dependências
```

### Frontend, vitest + React Testing Library

```bash
cd frontend
npm install
npm test          # roda uma vez
npm run test:watch  # modo watch
```

210 testes (hooks, componentes, views e o app admin), usando portas injetáveis (`ApiClientPort`/`AdminApiClientPort`) em vez de mockar módulos inteiros sempre que possível.

```bash
npx tsc -b --noEmit   # type-check
npm run lint          # eslint
npm audit --audit-level=high  # CVE conhecidos nas dependências
npm run build         # build de produção (valida os dois entry points: app + admin)
```

---

## 🔁 CI/CD

GitHub Actions roda a cada push em `main` ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)):

| Job | O que roda | Onde |
|---|---|---|
| `backend-ci` | ruff, mypy, bandit, pip-audit, pytest (cobertura) | runner do GitHub |
| `frontend-ci` | npm audit, eslint, vitest, build (tsc + vite) | runner do GitHub |
| `deploy` | `git pull` + `docker compose build --no-cache` + `up -d` + healthcheck | self-hosted runner na própria VPS |

O job de deploy só roda se os dois anteriores passarem, e faz uma checagem de saúde pós-deploy (`/health` do backend + frontend respondendo) antes de considerar a execução bem-sucedida, se a checagem falhar, o workflow falha e fica visível no histórico de Actions.

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
# App principal em http://localhost:5173
# Painel admin em http://localhost:5173/admin.html
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

O projeto usa **Nginx Proxy Manager** como reverse proxy na VPS com SSL automático via Let's Encrypt e **Cloudflare** para DNS. Backend e frontend não publicam porta nenhuma no host, só são alcançáveis via a rede Docker do proxy.

### Estrutura de redes Docker

As redes `proxy-network` e `database-network` devem existir antes do deploy:

```bash
docker network create proxy-network
docker network create database-network
```

### Deploy completo

```bash
# Na VPS, dentro do diretório do projeto
git pull origin main
docker compose up -d --build

# Depois de recriar o backend/frontend, force o Nginx Proxy Manager a reconhecer
# o novo IP do container (ele cacheia o IP anterior):
docker exec nginx-proxy-manager nginx -s reload
```

### Deploy apenas de um serviço

```bash
docker compose up -d --build backend
docker compose up -d --build frontend
```

### Configuração do Nginx Proxy Manager

1. **Proxy Host do frontend** (dedicado a este projeto):

   | Domain | Forward Hostname | Forward Port |
   |---|---|---|
   | `rewards.strokes.dev.br` | `rewards_frontend` | `80` |

2. **Custom Location no Proxy Host `api.strokes.dev.br`** (compartilhado entre projetos):

   | Location | Forward Hostname | Forward Port |
   |---|---|---|
   | `/rewards/` | `rewards_backend` | `8000` |

   > A barra final em `/rewards/` faz o Nginx remover o prefixo antes de repassar a requisição ao container, o backend continua recebendo `/api/v1/...`, `/health`, `/docs`, etc. como se estivesse na raiz. `ROOT_PATH=/rewards` no `.env` só existe para o Swagger/OpenAPI gerar os links públicos corretos.

Ative SSL (Let's Encrypt) e force HTTPS em ambos os Proxy Hosts.

### Migrações em produção

Aplicadas manualmente, uma vez, direto no container do Postgres:

```bash
docker exec -i postgres psql -U dbuser -d rewards_db < database/migrations/00X_nome.sql
```

---

## 🔔 Push Notifications (VAPID)

Web Push API com VAPID, sem dependência de serviços externos (OneSignal, Firebase, etc.). Funciona em iOS Safari (16.4+), Android Chrome/Firefox e navegadores desktop.

### Fluxo completo

```
1. Cliente abre o PWA e acessa Perfil → ativa notificações
2. Frontend solicita permissão ao navegador
3. Busca a VAPID_PUBLIC_KEY em GET /push/vapid-public-key
4. Cria PushSubscription no navegador
5. Envia para POST /push/subscribe (requer JWT)
6. Backend salva em push_subscriptions no PostgreSQL

7. Admin acessa /admin → envia push (individual, seleção de clientes ou broadcast)
8. Backend cria a notificação in-app + usa pywebpush para o envio real
9. Dispositivo recebe push mesmo com app fechado
10. Clique na notificação → Service Worker abre o app
```

### Testando via curl

```bash
# Login do painel admin → token de sessão
TOKEN=$(curl -s -X POST https://api.strokes.dev.br/rewards/api/v1/push/admin/login \
  -H "Content-Type: application/json" \
  -d '{"secret": "SEU_PUSH_ADMIN_SECRET"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Enviar para um cliente específico
curl -X POST https://api.strokes.dev.br/rewards/api/v1/push/send \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"customer_id": "7742", "title": "🎉 Promoção especial!", "message": "Cimento com 20% OFF hoje!", "url": "/"}'

# Broadcast para todos os clientes
curl -X POST https://api.strokes.dev.br/rewards/api/v1/push/broadcast \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title": "📢 Novidades na loja!", "message": "Confira os novos eventos e promoções.", "url": "/"}'
```

### Resposta esperada

```json
{ "message": "Push enviado", "sent": 2, "failed": 0, "removed": 0 }
```

> `removed` indica subscriptions expiradas que foram automaticamente limpas do banco.

---

## 🛡️ Painel Admin

App React separado (build multi-page do Vite), não misturado com o bundle do app do cliente.

**URL:** `https://rewards.strokes.dev.br/admin` (ou `/admin.html`)
**Senha:** valor de `PUSH_ADMIN_SECRET` no `.env`

### Abas

- **👤 Individual**, busca um cliente (nome, e-mail ou ID) e envia push pra ele
- **🎯 Selecionados**, busca e seleciona vários clientes, envia pra todos de uma vez (reporta IDs não encontrados, se houver)
- **📢 Broadcast**, envia pra todos os clientes com notificações ativas (com confirmação)
- **🕒 Histórico**, lista os envios recentes (tipo de alvo, quantos foram atingidos, enviados/falhados/removidos, quando)

Todas as abas têm pré-visualização em tempo real de como a notificação vai aparecer. O login troca a senha por um token de sessão (12h), o secret em si nunca fica salvo no navegador.

---

## 📡 API Reference

Base URL: `https://api.strokes.dev.br/rewards/api/v1`

Documentação interativa completa: `/docs` (Swagger UI)

### Autenticação

Endpoints de cliente (exceto `/auth/login` e `/push/vapid-public-key`) requerem:
```
Authorization: Bearer <JWT_TOKEN>
```

Endpoints do painel admin (`/push/send`, `/push/send-bulk`, `/push/broadcast`, `/push/admin/*`) requerem `Authorization: Bearer <token de admin>` (obtido em `/push/admin/login`) ou o header `X-Admin-Secret`.

### Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/auth/login` | ❌ | Login com e-mail/código + senha |
| POST | `/auth/logout` | ❌ | Logout (JWT é stateless, cosmético) |
| GET | `/auth/me` | JWT | Dados do usuário autenticado |
| GET | `/customers/me` | JWT | Perfil completo do cliente |
| PATCH | `/customers/me` | JWT | Atualizar dados do perfil |
| GET | `/customers/me/stats` | JWT | Estatísticas (total acumulado, resgatado) |
| GET | `/transactions` | JWT | Histórico paginado (`limit`, `offset`) |
| GET | `/notifications` | JWT | Notificações do cliente |
| PATCH | `/notifications/mark-read` | JWT | Marcar notificações específicas como lidas |
| PATCH | `/notifications/mark-all-read` | JWT | Marcar todas como lidas |
| DELETE | `/notifications/{id}` | JWT | Remover uma notificação |
| GET | `/events` | JWT | Eventos e promoções ativos |
| GET | `/products` | ❌ | Catálogo de produtos (com filtros) |
| GET | `/products/{id}` | ❌ | Detalhe de um produto |
| GET | `/push/vapid-public-key` | ❌ | Chave pública VAPID |
| POST | `/push/subscribe` | JWT | Registrar subscription do dispositivo |
| DELETE | `/push/unsubscribe` | JWT | Remover subscriptions do cliente |
| POST | `/push/admin/login` | ❌ | Troca `PUSH_ADMIN_SECRET` por token de sessão |
| GET | `/push/admin/customers` | Admin | Busca clientes (nome/e-mail/ID) |
| GET | `/push/admin/campaigns` | Admin | Histórico de envios |
| POST | `/push/send` | Admin | Enviar push pra um cliente |
| POST | `/push/send-bulk` | Admin | Enviar push pra uma lista de clientes |
| POST | `/push/broadcast` | Admin | Enviar push pra todos |

---

## 🎨 Frontend, Estrutura e Padrões

### Roteamento

O app principal usa **roteamento por estado** (`useState<ActivePage>`) em vez de React Router, simples para um SPA mobile-first de tela única:

```typescript
type ActivePage = 'inicio' | 'extrato' | 'eventos' | 'perfil' | 'ajuda' | 'termos' | 'privacidade'
```

O painel admin (`src/admin/`) é outro app React inteiramente separado, com seu próprio entry point e bundle, não compartilha rota nem estado com o app do cliente.

### Fluxo de dados

```
App.tsx (AuthenticatedApp)
  ├── useCustomer()      → GET /customers/me
  ├── useTransactions()  → GET /transactions (paginado)
  ├── useStats()         → GET /customers/me/stats
  │     ↓ merge em customerWithStats (useMemo)
  ├── HomeView    ← customer + transactions
  ├── HistoryView ← transactions + filtros (estado vive em App.tsx, sobrevive à troca de aba)
  ├── EventsView  ← useEvents() → GET /events
  └── ProfileView ← customer + usePushNotifications()
```

Cada hook de dados valida a resposta da API em runtime com **zod** (`XxxApiResponseSchema`) antes de mapear pro tipo de domínio, pega divergências de schema que o TypeScript sozinho não detectaria.

### Portas injetáveis

`ApiClientPort` (app principal) e `AdminApiClientPort` (painel admin) são interfaces que os hooks recebem por parâmetro, com o cliente HTTP real como valor padrão. Testes injetam um cliente fake em vez de mockar o módulo inteiro.

### Service Worker

`src/sw.ts` usa Workbox (`injectManifest`) para precache dos assets do app principal, limpeza de caches antigos e os handlers de `push`/`notificationclick`. O painel admin (`admin.html` e seu bundle) é excluído do precache de propósito, não faz parte da experiência offline do cliente.

---

## 📱 PWA, Instalação

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
DATABASE_URL=postgresql+psycopg://dbuser:SENHA@postgres:5432/rewards_db

# ── Debug ───────────────────────────────────────────────────────────────────
DEBUG=false

# ── Segurança JWT ───────────────────────────────────────────────────────────
SECRET_KEY=GERE_UMA_CHAVE_FORTE_AQUI       # python3 -c "import secrets; print(secrets.token_hex(32))"
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440           # 24 horas

# ── CORS ────────────────────────────────────────────────────────────────────
CORS_ORIGINS=["https://rewards.strokes.dev.br"]

# ── API ─────────────────────────────────────────────────────────────────────
API_V1_PREFIX=/api/v1

# ── Prefixo externo (path-based routing atrás do proxy compartilhado) ───────
# Vazio em desenvolvimento local.
ROOT_PATH=/rewards

# ── Frontend (build arg do Docker) ──────────────────────────────────────────
VITE_API_URL=https://api.strokes.dev.br/rewards/api/v1

# ── Push Notifications (VAPID) ──────────────────────────────────────────────
VAPID_PRIVATE_KEY=CHAVE_PRIVADA_BASE64
VAPID_PUBLIC_KEY=CHAVE_PUBLICA_BASE64
VAPID_ADMIN_EMAIL=admin@seudominio.com.br
PUSH_ADMIN_SECRET=SENHA_FORTE_AQUI         # python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

> ⚠️ O arquivo `.env` está no `.gitignore` e **nunca deve ser commitado**. Apenas o `.env.example` vai para o repositório.

---

## 🧠 Decisões Técnicas

### Por que roteamento por estado em vez de React Router?

Para um PWA mobile-first com uma única tela visível por vez e bottom nav, `useState<ActivePage>` é mais simples, sem overhead de configuração, e funciona bem com as animações de transição.

### Por que hexagonal em vez de só uma camada de services?

O projeto começou com uma camada de `services/` separada dos routers (regra de negócio fora do HTTP), o que já ajudava bastante. A migração pra hexagonal foi um passo além: `application/` (os casos de uso) passou a depender só de `ports/` (Protocols), nunca de SQLAlchemy diretamente, quem implementa o port é `adapters/db/`, injetado no composition root (`api/deps.py`). Na prática isso significa que a lógica de negócio pode ser testada com um fake em memória, sem precisar subir um Postgres, e trocar de banco (ou adicionar um segundo backend de dados) não tocaria em `application/` nem em `domain/`.

### Por que zod no frontend, se já tem TypeScript?

TypeScript só valida em tempo de compilação, não protege contra a API real devolver um formato diferente do esperado em runtime. Os schemas zod (`XxxApiResponseSchema`) validam a resposta de fato antes de confiar nela, e o tipo TypeScript é inferido do schema (`z.infer`), então os dois nunca divergem.

### Por que Web Push com VAPID em vez de Firebase/OneSignal?

Zero custo, zero dependência externa, dados ficam no próprio banco, mesmo código funciona em todos os browsers. A limitação é iOS 16.4+, mas o app já é PWA-only.

### Por que o painel admin é um app React separado (não parte do bundle principal)?

Cresceu de um HTML estático simples para uma ferramenta com estado real (busca, seleção múltipla, sessão, histórico). Separar em outro entry point do Vite mantém o bundle do cliente enxuto (o painel não é baixado por quem só usa o app) e permite reaproveitar os mesmos padrões (portas injetáveis, hooks, testes) do resto do frontend.

### Por que não Alembic para migrações?

Schema estável, um único desenvolvedor. Scripts SQL manuais e sequenciais em `database/migrations/` são mais simples de ler e aplicar. Alembic compensa quando o schema muda com frequência e/ou em equipe.

### Por que `injectManifest` em vez de `generateSW` no service worker?

`generateSW` não permite handlers customizados. `injectManifest` dá controle total sobre o Service Worker, necessário para o handler de `push` das notificações.

### Por que self-hosted runner para o deploy, em vez de um serviço gerenciado?

O deploy precisa rodar `docker compose build` direto na VPS onde os containers já vivem (`rewards_backend`/`rewards_frontend` usam redes Docker internas, sem porta publicada). Um runner self-hosted registrado na própria VPS (rodado como processo simples, sem systemd) evita depender de credenciais de deploy remoto (SSH, registry de imagens), o job `deploy` só roda depois que `backend-ci`/`frontend-ci` passam num runner do GitHub, isolado da VPS.

---

## 📦 Versões das dependências principais

### Backend

| Pacote | Versão |
|---|---|
| Python | 3.12 |
| FastAPI | 0.139.0 |
| Uvicorn | 0.50.0 |
| SQLAlchemy | 2.0.36 |
| Pydantic | 2.12.5 |
| psycopg | 3.3.3 |
| PyJWT | 2.13.0 |
| bcrypt | 5.0.0 |
| pywebpush | 2.0.0 |
| slowapi | 0.1.9 |

### Frontend

| Pacote | Versão |
|---|---|
| React | 19.2.0 |
| TypeScript | ~6.0.3 |
| Vite | ^8.1.3 |
| Tailwind CSS | ^4.1.18 |
| zod | ^4.4.3 |
| vite-plugin-pwa | ^1.3.0 |
| lucide-react | ^1.23.0 |
| vitest | ^4.1.9 |

---

## 📝 Licença

Código aberto para consulta, aprendizado e avaliação (portfólio/acadêmico). Todos os direitos reservados ao autor, sem licença de uso, cópia ou distribuição concedida.
