# US-026: Connect External Knowledge Source (Deferred — Phase 2)

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-026 |
| **Week** | Post-capstone (Phase 2) |
| **Classification** | Hybrid |
| **Learning topic** | MCP integration, pluggable source adapters |
| **Article** | TBD |
| **Git tag** | — |
| **Requirements** | Flow 6 (Connect External Knowledge), FR-17 |

## Actor

Team member / Knowledge owner

## User Story

As a **knowledge owner**, I want to **connect Jira, GitHub, Confluence, or an incident-report system** so that **content from those tools is indexed through the same RAG pipeline as uploaded files**.

## Preconditions

- Phase 1 complete: `knowledge_sources`, adapter registry, `ingest-source` jobs
- MCP server or equivalent API credentials configured
- Connector adapter implemented for at least one external system

## Steps

1. Navigate to Knowledge Sources → Connect.
2. Select a connector (e.g. Jira) and authorize via MCP or OAuth.
3. Choose scope (project, repo, space, or incident queue).
4. Trigger sync; system creates or updates `knowledge_sources` records with appropriate `sourceType`.
5. `ingest-source` jobs run through the same orchestrator as file uploads.
6. Indexed content appears in search and chat with citations referencing the external source.

## Expected Outcome

- External content is acquired without custom RAG code per connector.
- Each synced item has `sourceType` ≠ `file_upload` and adapter-specific `sourceConfig`.
- Re-sync updates existing sources and re-enqueues ingestion when content changes.

## Acceptance Criteria

- [ ] At least one MCP connector (Jira, GitHub, Confluence, or incidents) creates `knowledge_sources` records
- [ ] Ingestion uses existing `ingest-source` job type — no duplicate chunk/embed pipeline
- [ ] Search and chat return citations that identify the external source (issue key, PR link, etc.)
- [ ] Connector credentials stored securely; not passed in job payloads
- [ ] Failed connector sync surfaces actionable errors in UI

## Implementation Notes

**Deferred to Phase 2.** Phase 1 establishes the adapter contract and decoupled ingestion so this scenario requires connector UI and MCP wiring only — not a new indexing architecture.

See [ARCHITECTURE.md](../ARCHITECTURE.md) — Future: MCP Knowledge Connectors.
