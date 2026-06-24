# US-011: List Prompt Templates

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-011 |
| **Week** | 1 |
| **Classification** | Learning |
| **Learning topic** | Prompt template library management |
| **Article** | 5 Prompt Patterns Every Developer Should Know |
| **Git tag** | `week-01-prompts` |
| **Requirements** | FR-01 |

## Actor

Team member

## User Story

As a **team member**, I want to **browse all saved prompt templates grouped by pattern** so that **I can reuse proven prompts instead of writing from scratch**.

## Preconditions

- At least one prompt template exists (US-010)

## Steps

1. Navigate to Prompt Templates.
2. View a list of all templates showing name, pattern type, and variable count.
3. Optionally filter by pattern (zero-shot, few-shot, etc.).

## Expected Outcome

- All templates from MongoDB are displayed.
- Each entry shows enough metadata to select the right template.

## Acceptance Criteria

- [ ] `GET /api/prompt-templates` returns all templates
- [ ] UI displays pattern badge per template
- [ ] Empty state shown when no templates exist

## Implementation Notes

Supports the prompt template library learning deliverable. CRUD read operation.
