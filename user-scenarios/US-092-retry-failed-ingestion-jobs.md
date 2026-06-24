# US-092: Retry Failed Ingestion Jobs

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-092 |
| **Week** | 9 |
| **Classification** | Hybrid |
| **Learning topic** | Job queue retries for failed ingestion |
| **Article** | Making AI Apps Production-Ready |
| **Git tag** | `week-09-reliability` |
| **Requirements** | FR-13, NFR-03 |

## Actor

System

## User Story

As the **system**, I want to **retry failed `ingest-source` jobs before marking a knowledge source permanently failed** so that **transient worker or API errors don't require re-upload**.

## Preconditions

- Job queue with retry configuration
- Simulated transient failure during ingestion (e.g. embedding API timeout)

## Steps

1. Acquire a file source during simulated transient worker failure.
2. First `ingest-source` attempt fails; job requeued.
3. Worker retries up to 3 times with backoff.
4. On success: source status → `indexed`.
5. On persistent failure: source status → `failed` with error detail.

## Expected Outcome

- Failed ingestion jobs retry up to 3 times.
- Transient failures recover without user re-upload.
- Permanent failures clearly marked after retry exhaustion.

## Acceptance Criteria

- [ ] Failed `ingest-source` jobs retry up to 3 times before marking source `failed`
- [ ] Job queue retries configured with backoff
- [ ] Successful retry transitions source to `indexed`
- [ ] UI reflects retry in progress vs. permanent failure

## Implementation Notes

Combines job queue infrastructure (Week 3) with Week 9 reliability patterns. Extends US-034 failed state handling.
