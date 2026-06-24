# US-041: RAG Uses Vector Retrieval

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-041 |
| **Week** | 4 |
| **Classification** | Learning |
| **Learning topic** | Upgrading RAG from keyword to vector search |
| **Article** | Adding Semantic Search to Your App Without a PhD |
| **Git tag** | `week-04-semantic-search` |
| **Requirements** | FR-06, FR-08 |

## Actor

Team member

## User Story

As a **team member**, I want to **ask chat questions that benefit from semantic chunk matching** so that **RAG retrieval finds relevant context even when my question uses different words than the source**.

## Preconditions

- US-031 RAG chat working
- Chunks have embedding vectors (Week 4 upgrade)

## Steps

1. Ask a chat question using paraphrased language not present verbatim in documents.
2. System embeds the question and retrieves chunks via vector search.
3. Receive an accurate answer with citations to semantically matched chunks.

## Expected Outcome

- RAG retrieval upgraded from Week 3 keyword match to vector search.
- Improved recall for paraphrased or conceptual questions.

## Acceptance Criteria

- [ ] RAG chat uses vector retrieval for chunk selection
- [ ] Question embedding generated per request (one small vector)
- [ ] Top 5–10 chunks retrieved — never full corpus
- [ ] Citations reference vector-matched chunks

## Implementation Notes

Connects semantic search learning to chat Q&A. Key architecture query rule from ARCHITECTURE.md.
