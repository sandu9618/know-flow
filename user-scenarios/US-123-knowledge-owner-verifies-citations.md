# US-123: Knowledge Owner Verifies Citations

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-123 |
| **Week** | 12 |
| **Classification** | Hybrid |
| **Learning topic** | Trust workflow — cited answers vs source verification |
| **Article** | I Spent 3 Months Learning AI Integration — Here's What I Built |
| **Git tag** | `week-12-capstone` |
| **Requirements** | Primary Users — Knowledge owners |

## Actor

Knowledge owner

## User Story

As a **knowledge owner**, I want to **review an AI-generated answer alongside its cited source chunks and original document** so that **I can approve or reject the answer before sharing it with my team**.

## Preconditions

- Chat or agent answer with citations (US-032, US-052)
- US-121 view original document working
- Multiple indexed policy documents uploaded

## Steps

1. Receive an AI answer with citations in chat or agent output.
2. Click a citation to view the cited chunk text snippet.
3. Click "View original" to open the source document (US-121).
4. Compare AI answer claims against source material.
5. Decide answer is accurate, partially accurate, or needs correction.

## Expected Outcome

- Full traceability: answer → chunk citation → original document.
- Knowledge owner can confidently share verified answers internally.
- Misgrounded claims identifiable via source comparison.

## Acceptance Criteria

- [ ] Citations link to chunk text viewable in UI
- [ ] Original document accessible from citation context
- [ ] Answer, chunk snippet, and source document viewable in one review flow
- [ ] Workflow supports knowledge owner persona from REQUIREMENTS.md

## Implementation Notes

Cross-cutting trust scenario tying RAG citations (learning) to document viewing (infrastructure). Capstone demo highlight for knowledge owner persona.
