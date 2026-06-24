# KnowFlow

KnowFlow is an AI-powered knowledge assistant for teams. Users upload internal documents (policies, specs, meeting notes) to cloud storage; the system indexes them incrementally and provides semantic search and cited Q&A — without loading the entire document corpus into memory at query time.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite) |
| API | Node.js (Express or Fastify) |
| Workers | Python (FastAPI) — parsing, embeddings |
| Database | MongoDB (metadata, chunks, vectors, logs) |
| File storage | Cloud object storage (S3 / GCS / R2) |
| LLM | Provider-agnostic (`LlmClient` — Gemini, OpenAI, Anthropic, etc. via `LLM_PROVIDER`) |

## Documentation

| Document | Description |
|----------|-------------|
| [REQUIREMENTS.md](./REQUIREMENTS.md) | Product vision, user flows, functional and non-functional requirements |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flows, monorepo layout, ingestion and query patterns |
| [ROADMAP.md](./ROADMAP.md) | 12-week incremental build plan with deliverables and article mapping |

## Development Approach

Implementation follows the 12-week roadmap in [ROADMAP.md](./ROADMAP.md). Each weekly milestone should be tagged in git (e.g. `week-01-prompts`, `week-03-rag`) so articles and demos can link to the exact code state for that week.

## Status

Week 0 bootstrap complete — monorepo scaffolding, Docker services, API MongoDB connection, and minimal dev servers are in place. Week 1 begins with the prompt template library.

## Local Development

### Prerequisites

- **Node.js 24+** (see `.nvmrc`)
- **Python 3.11+**
- **Docker** (for local MongoDB and Redis)
- LLM provider API key and MongoDB connection string (see `.env.example`)

### Setup

```bash
# Clone and install Node dependencies (workspaces: apps/*, packages/*)
git clone <repo-url> knowflow && cd knowflow
npm install

# Environment
cp .env.example .env
# Edit .env — set LLM_API_KEY and confirm MONGODB_URI

# Python worker virtualenv
cd services/python-worker
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ../..

# Start infrastructure
npm run docker:up

# Start all dev servers (API :3000, web :5173, worker :8000)
npm run dev
```

### Verify

| Service | URL | Expected |
|---------|-----|----------|
| MongoDB | `docker compose ps` | `mongodb` container healthy |
| Node API | http://localhost:3000/health | `{ "data": { "status": "ok", "db": "connected" } }` |
| React web | http://localhost:5173 | App shell with sidebar navigation; feature placeholders show "Coming in Week N" |
| Python worker | http://localhost:8000/health | `{ "data": { "status": "ok" } }` |

```bash
curl -s http://localhost:3000/health
curl -s http://localhost:8000/health
```

### Port overrides

- API: set `PORT` in `.env` (default `3000`)
- Web: `npm run dev -w @knowflow/web -- --port 5174`
- Worker: edit the `uvicorn` port in root `package.json` `dev:worker` script

### Monorepo layout

```
apps/web/              React (Vite) — port 5173
apps/api/              Node.js Express API — port 3000
services/python-worker/  FastAPI worker — port 8000
packages/prompts/      Shared prompt templates (Week 1+)
```

Run individual services:

```bash
npm run dev:api
npm run dev:web
npm run dev:worker
```

Stop Docker services: `npm run docker:down`

### Troubleshooting

If the API exits on startup with a MongoDB connection error:

1. Confirm MongoDB is running: `docker compose ps` (container should be `healthy`)
2. Start MongoDB if needed: `npm run docker:up`
3. Confirm `MONGODB_URI` in `.env` matches your setup (default: `mongodb://localhost:27017/knowflow`)

If MongoDB stops while the API is running, `GET /health` returns **503** with `{ "data": { "status": "degraded", "db": "disconnected" } }`.
