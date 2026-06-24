# US-091: Retry on Transient API Failure

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-091 |
| **Week** | 9 |
| **Classification** | Learning |
| **Learning topic** | Exponential backoff, retry middleware |
| **Article** | Making AI Apps Production-Ready |
| **Git tag** | `week-09-reliability` |
| **Requirements** | FR-13, NFR-04 |

## Actor

System

## User Story

As the **system**, I want to **automatically retry LLM API calls on transient failures** so that **brief outages or rate limits don't fail user requests immediately**.

## Preconditions

- Retry middleware on `LlmClient` (all provider adapters)
- Ability to simulate 429, 500, or timeout errors

## Steps

1. Trigger a chat or agent request during simulated API failure.
2. Observe retry attempts with exponential backoff in logs.
3. On transient failure resolution, request succeeds.
4. On persistent failure, fallback model or degraded mode activates.

## Expected Outcome

- Retries on 429, 500, timeout with increasing delay.
- Fallback to secondary model (`LLM_FALLBACK_MODEL`) when primary unavailable.
- Errors logged with enough detail to debug.

## Acceptance Criteria

- [ ] Simulated API failure triggers retry and eventual success or fallback
- [ ] Exponential backoff configured on LLM API failures (provider-agnostic)
- [ ] Fallback to secondary model when primary is unavailable
- [ ] Errors logged with request context and attempt count

## Implementation Notes

Week 9 retry and fallback deliverable. Retry middleware wraps `LlmClient`, not individual vendor SDKs.
