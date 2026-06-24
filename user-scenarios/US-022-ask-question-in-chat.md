# US-022: Ask a Question About an Uploaded Document

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-022 |
| **Week** | 2 |
| **Classification** | Learning |
| **Learning topic** | LLM chat Q&A against document text |
| **Article** | Building a Document Q&A App with an LLM |
| **Git tag** | `week-02-llm-qa` |
| **Requirements** | FR-04 |

## Actor

Team member

## User Story

As a **team member**, I want to **ask a natural-language question about an uploaded document** so that **I get an AI-generated answer grounded in that document's content**.

## Preconditions

- At least one document uploaded with extracted text available
- LLM provider configured (`LLM_PROVIDER`, `LLM_API_KEY`, `LLM_CHAT_MODEL`)

## Steps

1. Navigate to Chat and select an uploaded document (or open chat from document detail).
2. Type a question (e.g. "What is the EU refund policy?").
3. Submit the question.
4. Receive an answer from the configured LLM provider based on the document text.

## Expected Outcome

- Node API sends question + full document text as context via `LlmClient` (Week 2 — no RAG yet).
- Answer is relevant to the uploaded content.
- Response appears in the chat interface.

## Acceptance Criteria

- [ ] Chat endpoint calls `LlmClient` with document text as context
- [ ] Answer addresses the user's question
- [ ] Works for single small documents (full text in context — acceptable for Week 2)
- [ ] No RAG or chunk retrieval yet
- [ ] No direct vendor SDK calls in controllers or services — only `LlmClient`

## Implementation Notes

Core Week 2 learning scenario. Article demo: document Q&A with a swappable LLM provider. Initial implementation may use one default provider (e.g. Gemini); switching providers requires only a new adapter and env config.
