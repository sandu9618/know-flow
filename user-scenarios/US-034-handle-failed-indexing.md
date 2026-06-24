# US-034: Handle Failed Knowledge Source Indexing

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-034 |
| **Week** | 3 |
| **Classification** | Infrastructure |
| **Article** | How RAG Works — and How I Built One in a Weekend |
| **Git tag** | `week-03-rag` |
| **Requirements** | NFR-08 |

## Actor

Team member

## User Story

As a **team member**, I want to **see when a knowledge source fails to index with a clear error message** so that **I can fix the issue and retry ingestion without re-uploading if the raw content is still valid**.

## Preconditions

- Ingestion pipeline running
- A corrupt or unsupported file available for testing

## Steps

1. Upload a file that will fail parsing (corrupt PDF or unsupported format).
2. Acquisition succeeds (`acquired`); ingestion fails.
3. Observe status transition to `failed`.
4. Read `errorMessage` on source detail.
5. Optionally trigger re-ingestion (`POST /sources/:id/ingest`) or re-upload a corrected file.

## Expected Outcome

- Source status set to `failed` with descriptive `errorMessage`.
- UI shows error state distinctly from `acquired` or `indexing`.
- Failed source excluded from RAG retrieval.
- Raw file remains in bucket — re-ingest possible without re-upload.

## Acceptance Criteria

- [ ] Failed sources show `failed` status in UI
- [ ] `errorMessage` field populated with actionable detail
- [ ] Chat does not retrieve chunks from failed sources
- [ ] User can delete source, re-upload, or trigger re-ingestion

## Implementation Notes

Error state UI — standard app behavior. Decoupled model allows retrying ingestion without re-acquiring content. Retry logic enhanced in Week 9 (US-092).
