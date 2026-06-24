# US-060: Multi-Agent Research Task

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-060 |
| **Week** | 6 |
| **Classification** | Learning |
| **Learning topic** | Multi-agent collaboration, role specialization |
| **Article** | I Built a Multi-Agent System — Here's What I Learned |
| **Git tag** | `week-06-multi-agent` |
| **Requirements** | FR-10 |

## Actor

Team member

## User Story

As a **team member**, I want to **submit a research task handled by specialized agents** so that **fact-finding and writing are done by agents best suited for each step**.

## Preconditions

- Single-agent flow working (Week 5)
- Researcher and Writer agents implemented

## Steps

1. Navigate to Agents and submit a complex task (e.g. "Write a cited summary of our refund and security policies").
2. Orchestrator assigns Researcher agent to find and extract facts.
3. Researcher output passed as structured input to Writer agent.
4. Writer formats facts into a polished, cited response.
5. User receives final answer.

## Expected Outcome

- Two agents collaborate via orchestrator handoff.
- Researcher focuses on retrieval and extraction; Writer on formatting.
- Both agents' steps logged separately.

## Acceptance Criteria

- [ ] Researcher output passed to Writer as structured input
- [ ] Orchestrator coordinates handoff between agents
- [ ] Final response is polished and cited
- [ ] Each agent's steps logged separately in `agent_runs`

## Implementation Notes

Core Week 6 multi-agent learning scenario.
