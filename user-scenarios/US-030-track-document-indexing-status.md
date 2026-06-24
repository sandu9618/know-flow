# US-030: Track Knowledge Source Indexing Status

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-030 |
| **Week** | 3 |
| **Classification** | Hybrid |
| **Learning topic** | Decoupled ingestion pipeline visibility |
| **Article** | How RAG Works — and How I Built One in a Weekend |
| **Git tag** | `week-03-rag` |
| **Requirements** | FR-03b, FR-05, NFR-08 |

## Actor

Team member

## User Story

As a **team member**, I want to **see my knowledge source move from acquired to indexed** so that **I know when it is ready for RAG-powered chat**.

## Preconditions

- File source acquired (US-020)
- `ingest-source` job enqueued by ingestion orchestrator

## Steps

1. Upload a file and observe status `acquired` immediately after upload completes.
2. Status transitions to `indexing` while the ingestion worker processes the source.
3. Status becomes `indexed` when chunks are stored.
4. `chunkCount` displayed on source detail.

## Expected Outcome

- UI polls or receives updates for source indexing status.
- User understands acquisition (upload) finished before ingestion (indexing) began.
- Same status model will apply to connector-synced sources in Phase 2.

## Acceptance Criteria

- [ ] Status transitions: `acquired` → `indexing` → `indexed`
- [ ] UI shows status badge on source list
- [ ] `chunkCount` populated after successful indexing
- [ ] Upload returns before ingestion completes; status updates asynchronously

## Implementation Notes

Job queue UI (infrastructure) + decoupled RAG ingestion (learning). See ARCHITECTURE — Ingestion flow (source-agnostic).
