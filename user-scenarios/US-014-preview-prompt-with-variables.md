# US-014: Preview Prompt with Variable Substitution

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-014 |
| **Week** | 1 |
| **Classification** | Learning |
| **Learning topic** | Variable substitution, pattern preview |
| **Article** | 5 Prompt Patterns Every Developer Should Know |
| **Git tag** | `week-01-prompts` |
| **Requirements** | FR-02 |

## Actor

Team member

## User Story

As a **team member**, I want to **select a prompt pattern, fill in variables, and preview the final prompt** so that **I can verify the assembled prompt before using it in downstream AI features**.

## Preconditions

- At least one template with `{{variable}}` placeholders exists

## Steps

1. Navigate to Prompt Templates.
2. Select a template (e.g. chain-of-thought summarizer).
3. Fill in each variable field (e.g. `text`, `audience`).
4. Click "Preview".
5. View the rendered prompt with all placeholders replaced.

## Expected Outcome

- Preview shows the exact string that would be sent to an LLM (in later weeks).
- Unfilled variables show a validation hint or placeholder marker.

## Acceptance Criteria

- [ ] `{{variable}}` substitution renders correctly in preview
- [ ] React picker shows pattern-specific helper text
- [ ] Preview updates live as variables are typed
- [ ] All 5 patterns work with at least one variable placeholder

## Implementation Notes

Primary Week 1 UI learning scenario. Article-ready demo of prompt patterns without an LLM provider.
