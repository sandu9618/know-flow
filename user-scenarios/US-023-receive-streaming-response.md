# US-023: Receive Streaming AI Response

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-023 |
| **Week** | 2 |
| **Classification** | Learning |
| **Learning topic** | LLM streaming responses |
| **Article** | Building a Document Q&A App with an LLM |
| **Git tag** | `week-02-llm-qa` |
| **Requirements** | FR-04 |

## Actor

Team member

## User Story

As a **team member**, I want to **see the AI response appear token-by-token in real time** so that **I get immediate feedback instead of waiting for the full answer**.

## Preconditions

- US-022 scenario environment ready
- Chat UI connected to streaming endpoint

## Steps

1. Ask a question in chat (US-022).
2. Observe the response area as text streams in incrementally.
3. Wait for the stream to complete with a clear "done" state.

## Expected Outcome

- `LlmClient.stream()` used server-side (provider adapter handles vendor-specific streaming).
- React UI renders partial response as chunks arrive.
- Stream completes without UI freeze or duplicate messages.

## Acceptance Criteria

- [ ] First tokens appear within ~2 seconds of submission
- [ ] Streaming works over SSE or equivalent
- [ ] UI handles stream interruption gracefully
- [ ] Final message matches complete streamed content
- [ ] Streaming path uses `LlmClient`, not a vendor SDK directly

## Implementation Notes

Demonstrates LLM streaming via the provider adapter — key Week 2 API learning topic.
