# US-050: Submit Research Task to Single Agent

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-050 |
| **Week** | 5 |
| **Classification** | Learning |
| **Learning topic** | Agent loop — observe, plan, act, reflect |
| **Article** | What is an AI Agent? A Developer's Honest Explanation |
| **Git tag** | `week-05-single-agent` |
| **Requirements** | FR-09 |

## Actor

Team member

## User Story

As a **team member**, I want to **submit a complex research question to an AI agent** so that **it autonomously retrieves documents, reasons, and returns a cited summary**.

## Preconditions

- Indexed document library available
- Agent orchestrator implemented in Node.js

## Steps

1. Navigate to Agents.
2. Enter a research task (e.g. "Summarize all security policies across uploaded documents").
3. Submit the task.
4. Agent runs autonomously: retrieve → reason → respond.
5. Receive final cited answer.

## Expected Outcome

- Agent completes multi-step task without manual intervention.
- Run recorded in `agent_runs` collection.
- Final answer includes citations to source chunks.

## Acceptance Criteria

- [ ] Agent completes a multi-step research task autonomously
- [ ] Research agent: receive question → retrieve docs → summarize → return cited answer
- [ ] Final answer includes citations
- [ ] Task status: `running` → `completed` or `failed`

## Implementation Notes

Core Week 5 agent fundamentals scenario. Article explains agent loop honestly.
