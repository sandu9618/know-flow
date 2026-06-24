# US-013: Delete a Prompt Template

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-013 |
| **Week** | 1 |
| **Classification** | Learning |
| **Learning topic** | Template lifecycle management |
| **Article** | 5 Prompt Patterns Every Developer Should Know |
| **Git tag** | `week-01-prompts` |
| **Requirements** | FR-01 |

## Actor

Knowledge owner

## User Story

As a **knowledge owner**, I want to **delete obsolete prompt templates** so that **the library stays clean and relevant**.

## Preconditions

- At least one prompt template exists

## Steps

1. Open Prompt Templates and select a template to remove.
2. Confirm deletion.
3. Verify the template no longer appears in the list.

## Expected Outcome

- `DELETE /api/prompt-templates/:id` removes the record from MongoDB.
- List view updates immediately.

## Acceptance Criteria

- [ ] Deleted template is not returned by `GET /api/prompt-templates`
- [ ] Deletion requires confirmation in UI
- [ ] 404 returned when deleting non-existent ID

## Implementation Notes

Completes Week 1 CRUD. No AI integration — pure prompt engineering tooling.
