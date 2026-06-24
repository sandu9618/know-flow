# US-025: Reject Oversized Upload

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-025 |
| **Week** | 2 |
| **Classification** | Infrastructure |
| **Article** | Building a Document Q&A App with an LLM |
| **Git tag** | `week-02-llm-qa` |
| **Requirements** | NFR-07 |

## Actor

Team member

## User Story

As a **team member**, I want to **receive a clear error when I try to upload a file that is too large** so that **I understand the limit and can choose a smaller file**.

## Preconditions

- Upload endpoint configured with max file size (e.g. 25 MB)

## Steps

1. Navigate to Documents and attempt to upload a file exceeding 25 MB.
2. See an immediate error message before or during upload.
3. Confirm no partial record created in MongoDB or bucket.

## Expected Outcome

- Upload rejected with HTTP 413 or equivalent.
- User-friendly message states the size limit.
- No orphaned bucket objects or DB records.

## Acceptance Criteria

- [ ] Files over 25 MB rejected at API level
- [ ] UI shows error before wasting upload bandwidth where possible
- [ ] No `documents` record created for rejected upload

## Implementation Notes

Guardrail / validation — not an AI learning topic. Required for production readiness.
