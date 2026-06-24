# US-043: Python Embedding Service

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-043 |
| **Week** | 4 |
| **Classification** | Infrastructure |
| **Article** | Adding Semantic Search to Your App Without a PhD |
| **Git tag** | `week-04-semantic-search` |
| **Requirements** | FR-07 |

## Actor

Developer

## User Story

As a **developer**, I want to **run a Python FastAPI embedding service** so that **the Node API can generate and store vector embeddings for chunks and queries**.

## Preconditions

- US-000 project setup complete
- Python worker directory configured

## Steps

1. Start Python worker on port 8000.
2. Call `POST /embed` with a text string — receive embedding vector.
3. Call batch embed endpoint with 10–50 chunk texts.
4. Node ingestion job invokes Python service during document processing.

## Expected Outcome

- FastAPI service exposes `/embed` with single and batch support.
- Embeddings stored on `chunks.embedding` field in MongoDB.
- Service health check available.

## Acceptance Criteria

- [ ] `/embed` endpoint returns vector of expected dimension
- [ ] Batch endpoint handles 10–50 texts per call
- [ ] Node API communicates with Python worker via HTTP
- [ ] Service recovers from transient embedding API failures

## Implementation Notes

Service setup and inter-process communication — scaffolding for Week 4 learning features. Article may reference service code but setup itself is infrastructure.
