# US-071: Agent Calculates Numeric Answer

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-071 |
| **Week** | 7 |
| **Classification** | Learning |
| **Learning topic** | Function calling — calculate tool |
| **Article** | Giving Your AI Agent Real Tools With Function Calling |
| **Git tag** | `week-07-tools` |
| **Requirements** | FR-11 |

## Actor

Team member

## User Story

As a **team member**, I want to **ask an agent a numeric question** so that **it uses a calculator tool instead of guessing arithmetic**.

## Preconditions

- `calculate` tool registered with LLM function calling (via active provider adapter)
- Agent orchestrator with tool router

## Steps

1. Submit a task with numeric computation (e.g. "If we have 847 employees and 12% take parental leave, how many is that?").
2. Agent invokes `calculate` tool with the expression.
3. Tool returns numeric result.
4. Agent includes correct number in final answer.

## Expected Outcome

- Calculator tool invoked for math — not LLM mental arithmetic.
- Tool call logged with input expression and output value.

## Acceptance Criteria

- [ ] Agent invokes `calculate` for numeric questions
- [ ] Calculation results are mathematically correct
- [ ] Tool call logged in `agent_runs`
- [ ] Agent explains the calculation in natural language

## Implementation Notes

Demonstrates tool routing for non-retrieval capabilities. Simple but effective article example.
