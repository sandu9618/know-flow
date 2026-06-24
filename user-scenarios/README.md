# KnowFlow User Scenarios

User scenarios for the full KnowFlow application, ordered to match the 12-week [LinkedIn article plan](../linkedin%20article%20plan.md) and [ROADMAP](../ROADMAP.md).

KnowFlow treats **knowledge acquisition** (file upload in Phase 1; Jira/GitHub/Confluence/incidents via MCP in Phase 2) as separate from **ingestion** (chunk → embed → index). Scenarios reflect that decoupling.

## Quick Links

| Document | Description |
|----------|-------------|
| [SCENARIO-CLASSIFICATION.md](./SCENARIO-CLASSIFICATION.md) | Learning vs infrastructure mapping for every scenario |
| [REQUIREMENTS.md](../REQUIREMENTS.md) | Product requirements FR-01–FR-17 |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | System design and data flows |

## Implementation Order

```
Week 0  → US-000, US-001, US-002          (Infrastructure bootstrap)
Week 1  → US-010 – US-014                 (Prompt engineering)
Week 2  → US-020 – US-025                 (File-upload acquisition + LLM Q&A)
Week 3  → US-030 – US-034                 (Source-agnostic RAG ingestion)
Week 4  → US-040 – US-043                 (Embeddings & semantic search)
Week 5  → US-050 – US-052                 (Single agent)
Week 6  → US-060 – US-062                 (Multi-agent)
Week 7  → US-070 – US-072                 (Tool use / function calling)
Week 8  → US-080 – US-081                 (LangChain comparison)
Week 9  → US-090 – US-092                 (Reliability)
Week 10 → US-100 – US-102                 (Cost tracking)
Week 11 → US-110 – US-112                 (Security)
Week 12 → US-120 – US-123                 (Capstone)
Post    → US-026                          (External connectors — Phase 2, deferred)
```

## Scenario Format

Each file includes:

- **Metadata** — ID, week, classification, article, git tag, requirements
- **Actor** — Team member, knowledge owner, developer, or system
- **User story** — As a … I want … so that …
- **Steps** — Numbered user/system actions
- **Expected outcome** — What success looks like
- **Acceptance criteria** — Checklist aligned with ROADMAP deliverables

## Personas

| Persona | Primary scenarios |
|---------|-------------------|
| **Team member** | Upload, search, chat, agents |
| **Knowledge owner** | Citations, cost dashboard, answer verification, external connectors (Phase 2) |
| **Developer** | Setup, benchmarks, security demo, deployment |
| **Visitor / Recruiter** | US-122 deployed app demo |

## Totals

| Classification | Count |
|----------------|-------|
| Learning | 30 |
| Infrastructure | 9 |
| Hybrid | 9 |
| **Total** | **48** |

See [SCENARIO-CLASSIFICATION.md](./SCENARIO-CLASSIFICATION.md) for the full index.
