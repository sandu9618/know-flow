# US-062: No Documents Found Gracefully

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-062 |
| **Week** | 6 |
| **Classification** | Learning |
| **Learning topic** | Empty retrieval handling in multi-agent systems |
| **Article** | I Built a Multi-Agent System — Here's What I Learned |
| **Git tag** | `week-06-multi-agent` |
| **Requirements** | FR-10 |

## Actor

Team member

## User Story

As a **team member**, I want to **receive a helpful response when the Researcher finds no relevant documents** so that **the system doesn't hallucinate or crash on empty results**.

## Preconditions

- Multi-agent system running
- No documents match the research query (or library is empty)

## Steps

1. Submit a research task about a topic not covered in uploaded documents.
2. Researcher agent searches and finds no relevant chunks.
3. Orchestrator handles empty result — Writer produces honest "no information found" response.
4. Agent run completes with `completed` status (not `failed`).

## Expected Outcome

- No fabricated citations or facts.
- Clear message explaining no matching documents were found.
- Agent steps log the empty retrieval attempt.

## Acceptance Criteria

- [ ] System handles case where Researcher finds no relevant documents
- [ ] Response explicitly states no sources found
- [ ] No hallucinated document references
- [ ] Run logged with retrieve step showing empty output

## Implementation Notes

Important edge case for multi-agent article "what went wrong" section. Honest failure modes build trust.
