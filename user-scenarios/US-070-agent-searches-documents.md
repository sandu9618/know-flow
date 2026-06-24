# US-070: Agent Searches Documents via Tool

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-070 |
| **Week** | 7 |
| **Classification** | Learning |
| **Learning topic** | Function calling — searchDocuments tool |
| **Article** | Giving Your AI Agent Real Tools With Function Calling |
| **Git tag** | `week-07-tools` |
| **Requirements** | FR-11 |

## Actor

Team member

## User Story

As a **team member**, I want to **ask an agent a question that requires searching my documents** so that **the agent invokes document search only when it needs retrieval**.

## Preconditions

- Agent with function calling configured
- `searchDocuments` tool registered with LLM function calling (via active provider adapter)
- Indexed document library

## Steps

1. Submit a task requiring document lookup (e.g. "What is our parental leave policy?").
2. Agent decides to invoke `searchDocuments` tool.
3. Tool router executes vector search and returns chunk results.
4. Agent synthesizes answer from tool output.

## Expected Outcome

- LLM function call triggers `searchDocuments`.
- Tool inputs and outputs logged in `agent_runs`.
- Answer grounded in tool results.

## Acceptance Criteria

- [ ] Agent invokes `searchDocuments` when it needs retrieval
- [ ] Tool call inputs and outputs logged in `agent_runs`
- [ ] Tool router in Node.js executes search and returns results to agent
- [ ] Agent does not search when question is general knowledge not in library

## Implementation Notes

Core Week 7 tool use scenario. Article demo: giving agents real capabilities.
