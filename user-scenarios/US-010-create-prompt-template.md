# US-010: Create a Prompt Template

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-010 |
| **Week** | 1 |
| **Classification** | Learning |
| **Learning topic** | Prompt engineering patterns (zero-shot, few-shot, chain-of-thought, role-based, structured JSON) |
| **Article** | 5 Prompt Patterns Every Developer Should Know |
| **Git tag** | `week-01-prompts` |
| **Requirements** | FR-01 |

## Actor

Team member

## User Story

As a **team member**, I want to **create a reusable prompt template using one of five prompt patterns** so that **I can consistently apply prompt engineering techniques to my tasks**.

## Preconditions

- US-000–US-002 completed
- At least one pattern type is available in `packages/prompts`

## Steps

1. Navigate to Prompt Templates.
2. Click "Create template".
3. Enter a name (e.g. `summarize-policy`).
4. Select a pattern (e.g. `zero-shot`).
5. Write template text with `{{variable}}` placeholders (e.g. `Summarize the following:\n\n{{text}}`).
6. Save the template.

## Expected Outcome

- Template is persisted in MongoDB `prompt_templates` collection.
- Template includes `name`, `pattern`, `template`, `variables`, `createdAt`, `updatedAt`.
- Template survives server restart.

## Acceptance Criteria

- [ ] `POST /api/prompt-templates` creates a new record
- [ ] All 5 patterns are supported
- [ ] Variables are extracted or declared from `{{variable}}` syntax
- [ ] No LLM or external AI integration yet

## Implementation Notes

Core Week 1 learning scenario. Demonstrates prompt pattern library in TypeScript.
