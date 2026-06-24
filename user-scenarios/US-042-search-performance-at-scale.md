# US-042: Search Performance at Scale

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-042 |
| **Week** | 4 |
| **Classification** | Learning |
| **Learning topic** | Batch embeddings, vector index performance |
| **Article** | Adding Semantic Search to Your App Without a PhD |
| **Git tag** | `week-04-semantic-search` |
| **Requirements** | FR-07, FR-08 |

## Actor

Team member

## User Story

As a **team member**, I want to **search a library of 50+ chunks and get results quickly** so that **semantic search feels responsive in real use**.

## Preconditions

- Library with 50+ indexed chunks across multiple documents
- MongoDB Atlas vector index configured

## Steps

1. Upload and index 10+ documents producing 50+ chunks.
2. Run several semantic search queries.
3. Measure response time in UI or network tab.

## Expected Outcome

- Search completes in under 2 seconds.
- Embeddings generated in batches of 10–50 chunks during ingestion.
- Vector index used at query time — no bucket reads.

## Acceptance Criteria

- [ ] Chunks have embedding vectors after ingestion
- [ ] Python worker processes embeddings in batches (10–50 chunks)
- [ ] Search responds in under 2 seconds for 50+ chunks
- [ ] No full corpus loaded into memory at query time

## Implementation Notes

Performance acceptance criterion from ROADMAP Week 4. Demonstrates batch embedding best practice.
