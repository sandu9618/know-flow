# US-121: View Original Document

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-121 |
| **Week** | 12 |
| **Classification** | Infrastructure |
| **Article** | I Spent 3 Months Learning AI Integration — Here's What I Built |
| **Git tag** | `week-12-capstone` |
| **Requirements** | ARCHITECTURE query rules |

## Actor

Knowledge owner

## User Story

As a **knowledge owner**, I want to **download or view the original uploaded file** so that **I can verify AI answers against the source PDF or document**.

> Applies to `sourceType: file_upload` only. Connector-backed sources link to external URLs (Phase 2).

## Preconditions

- File-upload source acquired with valid `sourceConfig.bucketKey`
- Source indexed in MongoDB

## Steps

1. From search results, chat citations, or source list, click "View original" or download.
2. System fetches single file from bucket via presigned URL or proxied stream.
3. Original PDF/DOCX/TXT opens or downloads in browser.

## Expected Outcome

- Bucket accessed only on explicit user action — never during search or chat.
- Presigned URL expires appropriately; bucket credentials not exposed to frontend.

## Acceptance Criteria

- [ ] `GET /sources/:id/download` (or `GET /documents/:id/download`) returns presigned URL or file stream for file-upload sources
- [ ] Bucket not queried during search or chat queries
- [ ] Only the requested single file fetched — not entire library
- [ ] Works for PDF, DOCX, and TXT formats

## Implementation Notes

Architecture query rule #4 from ARCHITECTURE.md. Cold storage access pattern — not an AI learning topic but essential for trust workflow.
