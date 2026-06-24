# US-024: Persist Conversation History

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-024 |
| **Week** | 2 |
| **Classification** | Hybrid |
| **Learning topic** | Multi-turn LLM chat with persisted context |
| **Article** | Building a Document Q&A App with an LLM |
| **Git tag** | `week-02-llm-qa` |
| **Requirements** | FR-04 |

## Actor

Team member

## User Story

As a **team member**, I want to **continue a conversation and see past messages after refresh** so that **I can have multi-turn Q&A sessions about my documents**.

## Preconditions

- At least one chat exchange completed

## Steps

1. Ask an initial question and receive an answer.
2. Ask a follow-up question referencing prior context (e.g. "Can you elaborate on that?").
3. Refresh the browser or navigate away and return to the conversation.
4. See full message history preserved.

## Expected Outcome

- Messages stored in MongoDB `conversations` collection.
- Follow-up questions pass prior messages to `LlmClient` as conversation context.
- History survives server restart.

## Acceptance Criteria

- [ ] `conversations` collection stores user and assistant messages with timestamps
- [ ] Follow-up questions maintain conversational context
- [ ] UI loads previous conversation on return
- [ ] Citations field present for later weeks (may be empty in Week 2)

## Implementation Notes

Combines standard persistence (infrastructure) with multi-turn LLM chat (learning).
