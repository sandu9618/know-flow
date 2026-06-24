# US-032: View Chunk-Level Citations

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-032 |
| **Week** | 3 |
| **Classification** | Learning |
| **Learning topic** | RAG citations — document title + chunk index |
| **Article** | How RAG Works — and How I Built One in a Weekend |
| **Git tag** | `week-03-rag` |
| **Requirements** | FR-06 |

## Actor

Knowledge owner

## User Story

As a **knowledge owner**, I want to **see which document chunks supported each AI answer** so that **I can verify the response is grounded in source material**.

## Preconditions

- US-031 completed — RAG chat returns answers
- Document indexed with numbered chunks

## Steps

1. Ask a question in chat that triggers RAG retrieval.
2. Receive an answer with citation references.
3. Click or expand a citation to see document title and chunk index.
4. Optionally view the cited chunk text snippet.

## Expected Outcome

- Assistant messages include `citations` array referencing chunk IDs.
- UI displays document title + chunk index per citation.
- User can trace answer back to source text.

## Acceptance Criteria

- [ ] Answers include chunk-level citations (document title + chunk index)
- [ ] Citations link to source chunk text or document detail
- [ ] Citations stored in `conversations.messages[].citations`

## Implementation Notes

Trust and transparency feature tied directly to RAG learning. Critical for knowledge owner persona.
