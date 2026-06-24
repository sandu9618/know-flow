# Plan User Scenario

Create an **implementation plan** for a specific KnowFlow user scenario. Do **not** write code yet — produce a clear, actionable plan the team can review before building.

## User scenario

The scenario is provided in one of these ways (use the first that applies):

1. **Text after this command** — everything the user typed after `/plan-user-scenario`
2. **@-mentioned files** — requirements, mockups, or notes attached to the chat
3. **Conversation context** — a scenario already described earlier in the thread

If the scenario is missing or too vague to plan against, ask **one** short clarifying question, then stop.

## Before planning

Read and align with project context:

- [ARCHITECTURE.md](../../ARCHITECTURE.md) — system layers, acquisition vs ingestion, monorepo layout
- [REQUIREMENTS.md](../../REQUIREMENTS.md) — core user flows and acceptance criteria
- [ROADMAP.md](../../ROADMAP.md) — which week/phase this scenario likely belongs to

Scan the repo for **existing** code, routes, collections, and UI that the scenario can extend — avoid planning duplicate work.

Apply layer conventions from `.cursor/rules/`:

- `react-web.mdc` — `apps/web`
- `nodejs-api.mdc` — `apps/api`
- `python-worker.mdc` — `services/python-worker`

When the plan touches API layers, follow the matching skills under `.cursor/skills/` (routes → controller → service → repository).

## Planning principles

- Respect **acquisition** (how content enters) vs **ingestion** (chunking, embedding, indexing) as separate steps connected by `knowledge_sources` and `ingest-source` jobs.
- Name concrete **API endpoints**, **MongoDB collections/fields**, **queue jobs**, and **UI screens/components** where relevant.
- Call out **Phase 1** (file upload) vs **Phase 2+** (MCP connectors) scope explicitly.
- Prefer extending existing patterns over new abstractions.
- Flag **dependencies** (e.g. vector search, Python worker, bucket storage) and **out-of-scope** items.
- Include **risks**, **edge cases**, and **open questions** only when they affect the plan.

## Output format

Return a single structured plan in markdown:

### 1. Scenario summary
- **Actor** — who performs the flow
- **Goal** — what they want to accomplish
- **Success criteria** — 3–5 testable outcomes

### 2. Current state
- What already exists in the codebase that supports this scenario
- Gaps vs the desired flow

### 3. End-to-end flow
- Numbered user steps (UI → API → worker → storage)
- Optional mermaid sequence or flowchart if the flow has 4+ moving parts

### 4. Implementation breakdown

| Layer | Changes | Key files / modules (if known) |
|-------|---------|--------------------------------|
| React (`apps/web`) | … | … |
| Node API (`apps/api`) | routes, controllers, services, jobs | … |
| Python worker (`services/python-worker`) | … | … |
| Data (MongoDB, bucket, queue) | collections, indexes, job types | … |
| Shared (`packages/`) | … | … |

### 5. API & data contract (if applicable)
- New or changed endpoints (method, path, request/response shape)
- New or changed documents / fields / statuses

### 6. Suggested build order
- Ordered checklist of small, reviewable steps (each step should be implementable in one focused session)

### 7. Testing & verification
- Manual test steps a developer can run locally
- Any automated tests worth adding (only if meaningful)

### 8. Roadmap fit
- Likely **week/phase** from ROADMAP.md
- What can ship now vs what should be deferred

## Constraints

- **Plan only** — no file edits, commits, or implementation unless the user explicitly asks to proceed.
- Keep the plan proportional: a simple UI tweak needs a short plan; a cross-layer flow needs full detail.
- Use precise language; avoid hand-wavy phrases like "add appropriate handling" without saying what handling means.
