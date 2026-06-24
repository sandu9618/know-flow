# US-051: View Agent Run Steps

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-051 |
| **Week** | 5 |
| **Classification** | Hybrid |
| **Learning topic** | Agent step logging and transparency |
| **Article** | What is an AI Agent? A Developer's Honest Explanation |
| **Git tag** | `week-05-single-agent` |
| **Requirements** | FR-09 |

## Actor

Team member

## User Story

As a **team member**, I want to **see each step my agent took during a research run** so that **I understand how it arrived at the answer and can debug failures**.

## Preconditions

- Agent run completed or in progress (US-050)

## Steps

1. Submit or open an agent research task.
2. View the agent run detail page.
3. See steps in chronological order: retrieve, reason, respond (or equivalent actions).
4. Expand a step to view input and output.

## Expected Outcome

- `agent_runs.steps[]` displayed in UI with timestamps.
- Each step shows `action`, `input`, `output`.
- Running tasks update steps in near real time.

## Acceptance Criteria

- [ ] Each step (retrieve, reason, respond) logged in `agent_runs`
- [ ] UI displays agent steps in chronological order
- [ ] Step detail shows enough context to debug
- [ ] Failed runs show the step where failure occurred

## Implementation Notes

Agent logging (learning) + React log viewer UI (infrastructure). Transparency is key to the Week 5 article thesis.
