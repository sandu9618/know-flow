# US-033: Source-Agnostic Ingestion Queue

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-033 |
| **Week** | 3 |
| **Classification** | Learning |
| **Learning topic** | Memory-efficient, decoupled ingestion — one source at a time |
| **Article** | How RAG Works — and How I Built One in a Weekend |
| **Git tag** | `week-03-rag` |
| **Requirements** | FR-03b, FR-05, NFR-01, NFR-03 |

## Actor

Developer / System

## User Story

As the **system**, I want to **process one knowledge source at a time through the `ingest-source` queue** so that **memory stays bounded regardless of how content was acquired**.

## Preconditions

- Job queue configured (BullMQ or equivalent)
- Multiple file sources acquired in quick succession (Phase 1)
- Ingestion orchestrator resolves text via source adapter registry

## Steps

1. Upload three files in succession (each reaches `acquired` independently).
2. Observe `ingest-source` jobs enqueued with one `sourceId` per job.
3. Worker processes sources sequentially — only one active at a time.
4. Each source transitions to `indexed` independently.
5. Worker uses file-upload adapter to stream from bucket (future connectors use their adapter instead).

## Expected Outcome

- Peak memory ≈ one source payload + one chunk batch.
- No worker loads all bucket objects or all connector payloads at startup.
- Queue provides backpressure under load.
- Job payload is `{ sourceId }` only — not tied to upload HTTP request.

## Acceptance Criteria

- [ ] Only one source processed per worker at a time
- [ ] Acquire → enqueue `ingest-source` → chunk → store pipeline runs via background job
- [ ] Worker streams or temp-files file sources — no full corpus in RAM
- [ ] Chunks persisted to MongoDB with `sourceId` before next source starts
- [ ] Ingestion code has no direct dependency on upload route handlers

## Implementation Notes

Architecture-critical learning scenario. Demonstrates decoupled acquisition vs. ingestion and why bucket ≠ search index (REQUIREMENTS problem statement). Same queue serves Phase 2 MCP connectors.
