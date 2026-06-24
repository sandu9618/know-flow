# US-001: Connect MongoDB and Bootstrap API

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-001 |
| **Week** | 0 (pre-requisite) |
| **Classification** | Infrastructure |
| **Article** | — |
| **Git tag** | — |
| **Requirements** | Foundation for FR-01+ |

## Actor

Developer

## User Story

As a **developer**, I want to **connect the Node API to MongoDB with a health endpoint** so that **data persistence works for all feature weeks**.

## Preconditions

- US-000 completed
- MongoDB running locally or via Atlas

## Steps

1. Configure MongoDB connection in the Node API.
2. Add a `GET /health` endpoint returning service and database status.
3. Verify connection survives API restart.

## Expected Outcome

- API reports `healthy` when MongoDB is reachable.
- Connection pooling and graceful shutdown are configured.

## Acceptance Criteria

- [ ] `GET /health` returns 200 with `{ status: "ok", db: "connected" }`
- [ ] API fails gracefully with clear error when MongoDB is down
- [ ] No LLM or AI integration required yet

## Implementation Notes

Standard backend plumbing. Enables Week 1 `prompt_templates` CRUD.
