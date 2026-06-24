# US-040: Semantic Search Across Document Library

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-040 |
| **Week** | 4 |
| **Classification** | Learning |
| **Learning topic** | Embeddings, vector similarity, semantic search |
| **Article** | Adding Semantic Search to Your App Without a PhD |
| **Git tag** | `week-04-semantic-search` |
| **Requirements** | FR-08 |

## Actor

Team member

## User Story

As a **team member**, I want to **search my document library using natural language** so that **I find relevant content even when my query words don't exactly match the document text**.

## Preconditions

- Multiple documents indexed with embeddings (Week 4)
- Semantic search page available in UI

## Steps

1. Navigate to Search.
2. Enter a query (e.g. "employee vacation rules").
3. Submit search.
4. View ranked snippet results from across all indexed documents.

## Expected Outcome

- Query string embedded via Python `/embed` endpoint.
- MongoDB vector search returns top-k matching chunks.
- Results ranked by semantic relevance with document metadata.

## Acceptance Criteria

- [ ] Semantic search returns relevant results across multiple documents
- [ ] Results show snippet text, document title, and relevance score
- [ ] Keyword-only queries that differ from document wording still match
- [ ] Search responds in under 2 seconds for 50+ chunks (see US-042)

## Implementation Notes

Primary Week 4 learning scenario and article demo.
