# US-072: Agent Combines Search and Calculation

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-072 |
| **Week** | 7 |
| **Classification** | Learning |
| **Learning topic** | Multi-tool agent tasks, tool routing |
| **Article** | Giving Your AI Agent Real Tools With Function Calling |
| **Git tag** | `week-07-tools` |
| **Requirements** | FR-11 |

## Actor

Team member

## User Story

As a **team member**, I want to **ask a question that requires both document lookup and calculation** so that **the agent chains multiple tools to produce a correct cited numeric answer**.

## Preconditions

- Both `searchDocuments` and `calculate` tools available
- Documents contain numeric facts (e.g. budget figures, headcount)

## Steps

1. Submit a compound task (e.g. "According to our budget document, what is 15% of the Q3 marketing allocation?").
2. Agent invokes `searchDocuments` to find the Q3 marketing figure.
3. Agent invokes `calculate` with the retrieved number and 15%.
4. Agent returns cited answer with correct calculation.

## Expected Outcome

- Multiple tool calls in single agent run.
- Correct final numeric answer with document citation.
- All tool calls logged sequentially.

## Acceptance Criteria

- [ ] Agent produces correct answer for question requiring both search and calculation
- [ ] Tool calls execute in logical order (search before calculate)
- [ ] Both tool inputs and outputs logged in `agent_runs`
- [ ] Final answer cites source document for the base number

## Implementation Notes

Week 7 capstone acceptance criterion from ROADMAP. Best demo for function calling article.
