# US-031: RAG Retrieval in Chat

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-031 |
| **Week** | 3 |
| **Classification** | Learning |
| **Learning topic** | RAG — chunking, top-k retrieval, context injection |
| **Article** | How RAG Works — and How I Built One in a Weekend |
| **Git tag** | `week-03-rag` |
| **Requirements** | FR-06 |

## Actor

Team member

## User Story

As a **team member**, I want to **ask a question and receive an answer based on retrieved document chunks** so that **responses are grounded in relevant sections instead of an entire document dump**.

## Preconditions

- Document indexed with chunks in MongoDB (US-030)
- RAG chat endpoint implemented

## Steps

1. Open Chat for an indexed document library.
2. Ask a specific question (e.g. "What are the security password requirements?").
3. System retrieves top-k relevant chunks (keyword or simple match in Week 3).
4. Configured LLM provider generates answer using only retrieved chunk context.

## Expected Outcome

- Chat no longer sends full document text — only top-k chunks.
- Answer is accurate for questions answerable from retrieved sections.
- Retrieval logged or inspectable for debugging.

## Acceptance Criteria

- [ ] Uploaded documents split into 500–1000 token chunks in `chunks` collection
- [ ] Chat retrieves relevant chunks instead of full document text
- [ ] Prompt assembly injects chunk text into LLM context via `LlmClient`
- [ ] Works across multiple indexed documents

## Implementation Notes

Core Week 3 RAG learning scenario. Article centerpiece.
