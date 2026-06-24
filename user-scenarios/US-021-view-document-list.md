# US-021: View Knowledge Source List

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-021 |
| **Week** | 2 |
| **Classification** | Infrastructure |
| **Article** | Building a Document Q&A App with an LLM |
| **Git tag** | `week-02-llm-qa` |
| **Requirements** | FR-03, FR-17 |

## Actor

Team member

## User Story

As a **team member**, I want to **see all knowledge sources with metadata** so that **I know which content is available for Q&A**.

## Preconditions

- At least one file source uploaded (US-020)

## Steps

1. Navigate to Knowledge Sources (or Documents).
2. View list showing title, source type, filename (for uploads), size, acquired date, and indexing status.

## Expected Outcome

- All sources from MongoDB `knowledge_sources` displayed in a sortable list.
- Phase 1 shows `sourceType: file_upload` only.
- Status shown as `acquired` initially (Week 2) or `acquired` / `indexing` / `indexed` / `failed` (Week 3+).

## Acceptance Criteria

- [ ] `GET /sources` (or `GET /documents`) returns source metadata (not raw content)
- [ ] `sourceType` displayed; file-upload sources show filename from `sourceConfig`
- [ ] List updates after new upload without full page reload
- [ ] Empty state guides user to upload first source

## Implementation Notes

Standard source list UI. Designed to accommodate connector-backed sources in Phase 2 without layout changes.
