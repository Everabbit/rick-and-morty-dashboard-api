# Rick and Morty Dashboard - API

API em Node.js + Express + TypeScript para armazenamento, consulta e sincronizacao de personagens da Rick and Morty API.

## Tecnologias

- Node.js
- TypeScript
- Express
- Sequelize
- PostgreSQL
- node-cron

## Visao geral

A API tem dois processos principais:

- Servidor HTTP: expoe endpoints de consulta e status
- Worker de sincronizacao: busca dados da API externa e faz upsert no banco

A sincronizacao roda:

- Uma vez ao iniciar o worker
- Depois a cada 5 minutos

## Requisitos

- Node.js 20+
- PostgreSQL 14+ (recomendado)
- npm

## Variaveis de ambiente

Crie um arquivo `.env` na pasta `api` com base em `.env.example`:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=rick-and-morty-db
DB_AUTO_SYNC=true
RICK_AND_MORTY_API_BASE_URL=https://rickandmortyapi.com/api
RICK_AND_MORTY_MAX_RETRIES=4
RICK_AND_MORTY_RETRY_BASE_DELAY_MS=500
RICK_AND_MORTY_RETRY_JITTER_MS=200
RICK_AND_MORTY_INTER_PAGE_DELAY_MS=300
RICK_AND_MORTY_TIMEOUT_MS=10000
```

## Instalacao

```bash
npm install
```

## Execucao em desenvolvimento

Inicia API e worker em paralelo:

```bash
npm run dev
```

Opcionalmente:

```bash
npm run dev:api
npm run dev:worker
```

## Build e execucao em producao

```bash
npm run build
npm run start
```

Ou separadamente:

```bash
npm run start:api
npm run start:worker
```

## Docker Compose (API + Banco + Worker)

Foi adicionado um `docker-compose.yml` na raiz deste repositorio para subir tudo com um unico comando:

- `db`: PostgreSQL 16
- `api`: servidor HTTP (porta `3000`)
- `worker`: processo de sincronizacao agendada

### Subir stack completa

Na raíz do repositório:

```bash
docker compose up --build
```

### Rodar em background

```bash
docker compose up --build -d
```

### Parar e remover containers

```bash
docker compose down
```

### Parar e remover tambem o volume do banco

```bash
docker compose down -v
```

### Testar API localmente com Docker

- Health check: `http://localhost:3000/health`
- Personagens: `http://localhost:3000/api/characters`
- Status da sync: `http://localhost:3000/api/sync/status`

## Scripts disponiveis

- `npm run dev`: API + worker (watch)
- `npm run dev:api`: apenas API (watch)
- `npm run dev:worker`: apenas worker (watch)
- `npm run build`: compila TypeScript para `dist`
- `npm run start`: API + worker (build compilado)
- `npm run start:api`: apenas API em producao
- `npm run start:worker`: apenas worker em producao

Scripts Docker uteis (executados na raiz do projeto):

- `docker compose up --build`: sobe db, api e worker
- `docker compose ps`: mostra status dos servicos
- `docker compose logs -f api`: acompanha logs da API
- `docker compose logs -f worker`: acompanha logs do worker

## Endpoints

### Health check

- Metodo: `GET`
- Rota: `/health`

Resposta:

```json
{
  "ok": true,
  "service": "rick-and-morty-api",
  "timestamp": "2026-04-22T20:00:00.000Z"
}
```

### Listar personagens

- Metodo: `GET`
- Rota: `/api/characters`

Query params suportados:

- `page` (inteiro positivo, padrao: 1)
- `limit` (inteiro positivo, maximo: 50, padrao: 20)
- `name` (texto)
- `species` (texto)
- `type` (texto)
- `originName` (texto)
- `locationName` (texto)
- `status` (enum numerico: 1=ALIVE, 2=DEAD, 3=UNKNOWN)
- `gender` (enum numerico: 1=FEMALE, 2=MALE, 3=GENDERLESS, 4=UNKNOWN)
- `episodeCountMin` (inteiro >= 0)
- `episodeCountMax` (inteiro >= 0)
- `sortBy`:
  - `externalId`
  - `name`
  - `status`
  - `species`
  - `gender`
  - `originName`
  - `locationName`
  - `type`
  - `episodeCount`
  - `lastSyncedAt`
  - `updatedAt`
- `sortOrder` (`ASC` ou `DESC`, padrao: `ASC`)

Exemplo:

```http
GET /api/characters?page=1&limit=20&name=rick&status=1&sortBy=name&sortOrder=ASC
```

Resposta:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 826,
    "totalPages": 42,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "appliedFilters": {
    "name": "rick",
    "status": 1,
    "sortBy": "name",
    "sortOrder": "ASC"
  },
  "data": [
    {
      "id": 1,
      "externalId": 1,
      "name": "Rick Sanchez",
      "status": 1,
      "species": "Human",
      "type": "",
      "gender": 2,
      "originName": "Earth (C-137)",
      "locationName": "Citadel of Ricks",
      "image": "https://...",
      "episodeCount": 51,
      "lastSyncedAt": "2026-04-22T19:55:00.000Z",
      "createdAt": "2026-04-22T18:00:00.000Z",
      "updatedAt": "2026-04-22T19:55:00.000Z"
    }
  ]
}
```

### Status da ultima sincronizacao

- Metodo: `GET`
- Rota: `/api/sync/status`

Resposta de sucesso:

```json
{
  "id": 10,
  "status": "success",
  "startedAt": "2026-04-22T19:55:00.000Z",
  "finishedAt": "2026-04-22T19:55:12.000Z",
  "totalFetched": 826,
  "totalUpserted": 826,
  "totalFailed": 0,
  "retryCount": 2,
  "errorSummary": null,
  "createdAt": "2026-04-22T19:55:00.000Z",
  "updatedAt": "2026-04-22T19:55:12.000Z"
}
```

Se nao houver sincronizacao registrada, retorna `404`.

## Rate limit

Todas as rotas em `/api` possuem limite:

- Janela: 60 segundos
- Maximo: 60 requisicoes por IP

Resposta quando excede:

```json
{
  "message": "Limite de requisicoes excedido",
  "details": "Tente novamente em alguns segundos"
}
```

## CORS

Origens permitidas:

- `http://localhost:9000`
- `https://rick-and-morty-dashboard-front.vercel.app`

Se voce usar outro dominio no frontend, ajuste a configuracao de CORS.

## Banco de dados

A API inicializa os modelos e valida conexao com o PostgreSQL no startup.

Com `DB_AUTO_SYNC=true`, as tabelas sao criadas/atualizadas automaticamente no startup.

Tabelas usadas:

- `characters`
- `sync_runs`

Observacao importante:

- Nao ha migrations versionadas no projeto no estado atual.
- Em Docker Compose, `DB_AUTO_SYNC=true` ja deixa o ambiente funcional automaticamente.

## Estrutura principal

```text
src/
  config/        # Leitura e validacao de env
  controllers/   # Controladores HTTP
  database/      # Conexao Sequelize
  middlewares/   # Rate limit, erros, validacao de query
  models/        # Models Sequelize
  routes/        # Definicao de rotas
  services/      # Consulta, cliente externo e sincronizacao
  workers/       # Worker cron de sincronizacao
```

## Troubleshooting rapido

### Erro de conexao com banco

- Verifique host, porta, usuario, senha e nome do banco no `.env`.
- Confirme que o PostgreSQL esta ativo.

### Rotas `/api` retornando 429

- O rate limit foi atingido (60 req/min).
- Aguarde alguns segundos e tente novamente.

### `/api/sync/status` retornando 404

- Ainda nao houve execucao de sincronizacao com sucesso/parcial/falha registrada.
- Inicie o worker e aguarde a primeira rodada.
