# US-120: End-to-End Knowledge Workflow

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-120 |
| **Week** | 12 |
| **Classification** | Learning |
| **Learning topic** | Capstone integration — full AI knowledge application |
| **Article** | I Spent 3 Months Learning AI Integration — Here's What I Built |
| **Git tag** | `week-12-capstone` |
| **Requirements** | FR-16 |

## Actor

Team member

## User Story

As a **team member**, I want to **complete the full KnowFlow workflow in one session** so that **I can add file knowledge sources, search, chat, and run agents as an integrated knowledge platform**.

## Preconditions

- All Weeks 1–11 features deployed
- Public or staging environment available
- 10+ sample files prepared

## Steps

1. **Prompts:** Create and preview a prompt template (Week 1).
2. **Acquire:** Upload 10+ files; each reaches `acquired` then `indexed` via decoupled ingestion (Weeks 2–4).
3. **Search:** Run semantic search across the library (Week 4).
4. **Chat:** Ask RAG-powered questions with citations (Weeks 3–4).
5. **Agent:** Submit a multi-tool research task (Weeks 5–7).
6. **Ops:** Confirm cost dashboard shows usage; verify degraded mode and security defenses are active (Weeks 9–11).

## Expected Outcome

- Full acquire → ingest → search → chat → agent flow works end-to-end.
- Architecture supports future connector sources (US-026) without changing ingestion or RAG.
- All 12 git tags documented in README.
- Demo-ready for capstone article and video.

## Acceptance Criteria

- [ ] Upload 10+ file sources; all indexed without memory issues
- [ ] Semantic search returns relevant results in under 2 seconds
- [ ] Chat returns cited answers grounded in indexed content
- [ ] Agent completes multi-step research task using tools
- [ ] Cost dashboard and security defenses are live

## Implementation Notes

Capstone acceptance criteria from REQUIREMENTS success criteria. Primary Week 12 article narrative. Phase 2 connector demo optional stretch goal.
