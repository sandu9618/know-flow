# US-090: Graceful Degradation When AI Is Down

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-090 |
| **Week** | 9 |
| **Classification** | Learning |
| **Learning topic** | Graceful degradation, fallback UX |
| **Article** | Making AI Apps Production-Ready |
| **Git tag** | `week-09-reliability` |
| **Requirements** | FR-13 |

## Actor

Team member

## User Story

As a **team member**, I want to **still use search when the AI service is unavailable** so that **the app remains useful instead of showing a blank error screen**.

## Preconditions

- Semantic search working (Week 4)
- Reliability middleware implemented
- LLM can be simulated as unavailable

## Steps

1. Simulate or encounter LLM provider outage.
2. Attempt to ask a question in chat.
3. See message: "AI unavailable — showing search results only."
4. View semantic search results for the query instead of a generated answer.
5. Confirm UI does not crash.

## Expected Outcome

- Chat degrades to search-only mode when LLM is down.
- User receives relevant chunks even without AI synthesis.
- Clear communication about degraded mode.

## Acceptance Criteria

- [ ] Chat degrades gracefully without crashing the UI
- [ ] UI shows "AI unavailable — showing search results only" when LLM is down
- [ ] Semantic search still returns results in degraded mode
- [ ] User can retry chat when service recovers

## Implementation Notes

Core Week 9 reliability learning. Production-readiness pattern for AI apps.
