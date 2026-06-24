# US-102: Log Every LLM Call

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-102 |
| **Week** | 10 |
| **Classification** | Hybrid |
| **Learning topic** | Token counter middleware, usage_logs schema |
| **Article** | How to Stop Burning Money on LLM API Calls |
| **Git tag** | `week-10-cost-tracking` |
| **Requirements** | FR-14, NFR-05 |

## Actor

Developer / System

## User Story

As a **developer**, I want to **automatically log token usage for every LLM call** so that **cost tracking is complete and requires no manual instrumentation per endpoint**.

## Preconditions

- Chat, RAG, agent, and embedding endpoints active
- Token counter middleware implemented on `LlmClient`

## Steps

1. Make LLM calls via chat, agent, and RAG endpoints.
2. Verify each call creates a `usage_logs` record.
3. Confirm fields: `endpoint`, `provider`, `model`, `promptTokens`, `completionTokens`, `estimatedCostUsd`, `createdAt`.

## Expected Outcome

- Middleware intercepts all `LlmClient` calls transparently (any active provider).
- No endpoint bypasses logging.
- Dashboard data stays in sync with actual usage.

## Acceptance Criteria

- [ ] Every LLM call records token usage in `usage_logs`
- [ ] Middleware logs `promptTokens`, `completionTokens`, `estimatedCostUsd` per request
- [ ] `provider` and `model` recorded for cost attribution across providers
- [ ] Embedding calls logged separately if they incur cost
- [ ] Logging failure does not break primary request (log-and-continue)

## Implementation Notes

Middleware plumbing (infrastructure) in service of token management learning (Week 10 topic). Provider-specific pricing tables live in the adapter layer.
