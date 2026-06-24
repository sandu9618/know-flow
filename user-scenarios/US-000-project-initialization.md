# US-000: Initialize Project and Local Development Environment

## Metadata


| Field              | Value                   |
| ------------------ | ----------------------- |
| **ID**             | US-000                  |
| **Week**           | 0 (pre-requisite)       |
| **Classification** | Infrastructure          |
| **Article**        | —                       |
| **Git tag**        | —                       |
| **Requirements**   | Foundation for all FR-* |


## Actor

Developer

## User Story

As a **developer**, I want to **bootstrap the KnowFlow monorepo with local services** so that **I can run and extend the application incrementally across all 12 weeks**.

## Preconditions

- Node.js 24+, Python 3.11+, Docker installed
- LLM provider API key (`LLM_API_KEY`) and MongoDB connection string available in `.env`

## Steps

1. Clone the repository and install dependencies (`apps/web`, `apps/api`, `packages/prompts`, `services/python-worker`).
2. Copy `.env.example` to `.env` and fill in required secrets.
3. Run `docker-compose up` to start MongoDB (and Redis when needed).
4. Start the Node API, React dev server, and Python worker.
5. Verify all services respond on their expected ports.

## Expected Outcome

- Monorepo layout matches [ARCHITECTURE.md](../ARCHITECTURE.md): `apps/web`, `apps/api`, `services/python-worker`, `packages/prompts`.
- Local development stack runs without errors.
- Environment variables are documented in README.

## Acceptance Criteria

- [ ] `docker-compose up` starts MongoDB successfully
- [ ] Node API starts on port 3000
- [ ] React dev server starts on port 5173
- [ ] Python worker starts on port 8000 (when Week 4+ is reached)
- [ ] `.env.example` lists all required variables without exposing secrets

## Implementation Notes

Non-learning scaffolding. Required before Week 1 deliverables. Not article content — supports all subsequent learning weeks.