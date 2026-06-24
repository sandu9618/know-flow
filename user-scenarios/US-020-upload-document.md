# US-020: Upload a File Knowledge Source

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-020 |
| **Week** | 2 |
| **Classification** | Hybrid |
| **Learning topic** | File-upload acquisition adapter (decoupled from ingestion) |
| **Article** | Building a Document Q&A App with an LLM |
| **Git tag** | `week-02-llm-qa` |
| **Requirements** | FR-03, FR-03a, FR-17, NFR-07 |

## Actor

Team member

## User Story

As a **team member**, I want to **upload a PDF or TXT file to KnowFlow** so that **it is stored as a knowledge source and can be indexed for AI Q&A**.

## Preconditions

- Cloud bucket configured (S3 / GCS / R2)
- Week 1 complete

## Steps

1. Navigate to Knowledge Sources (or Documents).
2. Click "Upload" and select a PDF or TXT file (under 25 MB).
3. See upload progress indicator.
4. Receive confirmation when acquisition completes.
5. Source appears with status `acquired` — indexing may still be in progress (see US-030).

## Expected Outcome

- Raw file stored in cloud bucket with a unique `bucketKey` in `sourceConfig`.
- `knowledge_sources` record created with `sourceType: file_upload` and status `acquired`.
- UI shows the new source in the list.
- Upload handler does **not** parse, chunk, or embed inline — ingestion is triggered separately.

## Acceptance Criteria

- [ ] `POST /sources/upload` (or `POST /documents`) accepts PDF and TXT
- [ ] File appears in bucket and metadata in `knowledge_sources`
- [ ] Upload progress visible in UI
- [ ] Upload response returns before ingestion completes
- [ ] `ingest-source` job enqueued after successful acquisition (not inside upload handler logic)
- [ ] Files over 25 MB rejected with clear error (see US-025)

## Implementation Notes

Phase 1 file-upload adapter. Acquisition only — ingestion orchestrator (US-033) processes the source asynchronously. Future connectors (US-026) follow the same `knowledge_sources` contract.
