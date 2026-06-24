# US-061: See Agent Contributions

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-061 |
| **Week** | 6 |
| **Classification** | Learning |
| **Learning topic** | Agent attribution and handoff visibility |
| **Article** | I Built a Multi-Agent System — Here's What I Learned |
| **Git tag** | `week-06-multi-agent` |
| **Requirements** | FR-10 |

## Actor

Team member

## User Story

As a **team member**, I want to **see which agent produced which part of the answer** so that **I understand the multi-agent workflow and can evaluate each agent's contribution**.

## Preconditions

- Multi-agent run completed (US-060)

## Steps

1. Open a completed multi-agent run.
2. View step log filtered or labeled by agent (`researcher`, `writer`).
3. See Researcher steps (search, extract) separate from Writer steps (format, respond).
4. Final answer UI indicates Writer output with Researcher-sourced facts.

## Expected Outcome

- UI clearly attributes steps to `researcher` or `writer`.
- User can trace facts from retrieval through to final prose.

## Acceptance Criteria

- [ ] User sees which agent produced which part of the answer
- [ ] Step log includes `agent` field per step
- [ ] UI distinguishes agent roles visually (labels, colors, or sections)

## Implementation Notes

Transparency feature for multi-agent article — "here's what I learned" includes showing the handoff.
