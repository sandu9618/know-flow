# US-012: Edit an Existing Prompt Template

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-012 |
| **Week** | 1 |
| **Classification** | Learning |
| **Learning topic** | Prompt pattern consistency and template refinement |
| **Article** | 5 Prompt Patterns Every Developer Should Know |
| **Git tag** | `week-01-prompts` |
| **Requirements** | FR-01 |

## Actor

Knowledge owner

## User Story

As a **knowledge owner**, I want to **edit an existing prompt template** so that **I can refine prompts as I learn which patterns work best**.

## Preconditions

- At least one prompt template exists

## Steps

1. Open Prompt Templates and select a template.
2. Modify the template text, pattern, or variables.
3. Save changes.
4. Re-open the template and confirm updates persisted.

## Expected Outcome

- `PUT /api/prompt-templates/:id` updates the record.
- `updatedAt` timestamp reflects the change.

## Acceptance Criteria

- [ ] Edited template text persists after server restart
- [ ] Variable list updates when placeholders change
- [ ] Invalid pattern values are rejected with clear error

## Implementation Notes

Part of Week 1 MongoDB CRUD deliverable. Reinforces prompt engineering as an iterative practice.
