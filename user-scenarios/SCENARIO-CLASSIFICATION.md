# KnowFlow — User Scenario Classification

Maps every user scenario to its **implementation week** (aligned with [linkedin article plan.md](../linkedin%20article%20plan.md) and [ROADMAP.md](../ROADMAP.md)) and whether it is **learning-driven** or **infrastructure / non-learning**.

## Legend

| Classification | Meaning |
|----------------|---------|
| **Learning** | Directly demonstrates or validates the week's AI/LLM learning topic. Primary article content. |
| **Infrastructure** | Required scaffolding not tied to a specific learning topic — project setup, generic CRUD, UI shells, deployment, plumbing. |
| **Hybrid** | Combines learning concepts with standard app development (e.g. chat UI that streams LLM responses). |

## Summary by Week

| Week | Article | Learning scenarios | Infrastructure scenarios | Hybrid scenarios |
|------|---------|-------------------|-------------------------|------------------|
| 0 | — | 0 | 3 | 0 |
| 1 | 5 Prompt Patterns Every Developer Should Know | 5 | 0 | 0 |
| 2 | Building a Document Q&A App with an LLM | 2 | 2 | 2 |
| 3 | How RAG Works — and How I Built One in a Weekend | 4 | 1 | 1 |
| 4 | Adding Semantic Search to Your App Without a PhD | 3 | 1 | 0 |
| 5 | What is an AI Agent? A Developer's Honest Explanation | 2 | 0 | 1 |
| 6 | I Built a Multi-Agent System — Here's What I Learned | 3 | 0 | 0 |
| 7 | Giving Your AI Agent Real Tools With Function Calling | 3 | 0 | 0 |
| 8 | LangChain vs Raw API — Which Should You Use? | 2 | 0 | 0 |
| 9 | Making AI Apps Production-Ready | 2 | 0 | 1 |
| 10 | How to Stop Burning Money on LLM API Calls | 2 | 0 | 1 |
| 11 | Prompt Injection — What It Is and How to Defend Against It | 2 | 0 | 1 |
| 12 | I Spent 3 Months Learning AI Integration — Here's What I Built | 1 | 2 | 1 |
| Post | — (Phase 2 connectors) | 0 | 0 | 1 |
| **Total** | | **30** | **9** | **9** |

---

## Full Scenario Index

| ID | Scenario file | Week | Classification | Learning topic (if applicable) |
|----|---------------|------|----------------|--------------------------------|
| US-000 | [US-000-project-initialization.md](./US-000-project-initialization.md) | 0 | Infrastructure | Monorepo, docker-compose, env setup |
| US-001 | [US-001-database-and-api-bootstrap.md](./US-001-database-and-api-bootstrap.md) | 0 | Infrastructure | MongoDB connection, API health check |
| US-002 | [US-002-web-app-shell-and-navigation.md](./US-002-web-app-shell-and-navigation.md) | 0 | Infrastructure | React app shell, routing, layout |
| US-010 | [US-010-create-prompt-template.md](./US-010-create-prompt-template.md) | 1 | Learning | Prompt patterns, variable placeholders |
| US-011 | [US-011-list-prompt-templates.md](./US-011-list-prompt-templates.md) | 1 | Learning | Template library management |
| US-012 | [US-012-edit-prompt-template.md](./US-012-edit-prompt-template.md) | 1 | Learning | CRUD + pattern consistency |
| US-013 | [US-013-delete-prompt-template.md](./US-013-delete-prompt-template.md) | 1 | Learning | Template lifecycle |
| US-014 | [US-014-preview-prompt-with-variables.md](./US-014-preview-prompt-with-variables.md) | 1 | Learning | Variable substitution, pattern preview |
| US-020 | [US-020-upload-document.md](./US-020-upload-document.md) | 2 | Hybrid | File-upload acquisition adapter (decoupled from ingestion) |
| US-021 | [US-021-view-document-list.md](./US-021-view-document-list.md) | 2 | Infrastructure | Knowledge source list UI, `sourceType` metadata |
| US-022 | [US-022-ask-question-in-chat.md](./US-022-ask-question-in-chat.md) | 2 | Learning | LLM chat Q&A against document text |
| US-023 | [US-023-receive-streaming-response.md](./US-023-receive-streaming-response.md) | 2 | Learning | LLM streaming API |
| US-024 | [US-024-persist-conversation-history.md](./US-024-persist-conversation-history.md) | 2 | Hybrid | Conversation persistence + chat UX |
| US-025 | [US-025-reject-oversized-upload.md](./US-025-reject-oversized-upload.md) | 2 | Infrastructure | File size guardrail (NFR-07) |
| US-026 | [US-026-connect-external-knowledge-source.md](./US-026-connect-external-knowledge-source.md) | Post | Hybrid | MCP connectors — Jira, GitHub, Confluence, incidents (Phase 2) |
| US-030 | [US-030-track-document-indexing-status.md](./US-030-track-document-indexing-status.md) | 3 | Hybrid | Decoupled ingestion status + job queue |
| US-031 | [US-031-rag-retrieval-in-chat.md](./US-031-rag-retrieval-in-chat.md) | 3 | Learning | Chunking, top-k retrieval, context injection |
| US-032 | [US-032-view-chunk-citations.md](./US-032-view-chunk-citations.md) | 3 | Learning | RAG citations (document + chunk index) |
| US-033 | [US-033-single-file-ingestion-queue.md](./US-033-single-file-ingestion-queue.md) | 3 | Learning | Source-agnostic `ingest-source` queue, memory bounds |
| US-034 | [US-034-handle-failed-indexing.md](./US-034-handle-failed-indexing.md) | 3 | Infrastructure | Error state UI; re-ingest without re-upload |
| US-040 | [US-040-semantic-search-across-library.md](./US-040-semantic-search-across-library.md) | 4 | Learning | Embeddings, vector similarity, semantic search |
| US-041 | [US-041-rag-uses-vector-retrieval.md](./US-041-rag-uses-vector-retrieval.md) | 4 | Learning | Vector search upgrade for RAG |
| US-042 | [US-042-search-performance-at-scale.md](./US-042-search-performance-at-scale.md) | 4 | Learning | Batch embeddings, sub-2s search at 50+ chunks |
| US-043 | [US-043-python-embedding-service.md](./US-043-python-embedding-service.md) | 4 | Infrastructure | Python FastAPI worker setup |
| US-050 | [US-050-submit-research-task-to-agent.md](./US-050-submit-research-task-to-agent.md) | 5 | Learning | Agent loop — observe, plan, act, reflect |
| US-051 | [US-051-view-agent-run-steps.md](./US-051-view-agent-run-steps.md) | 5 | Hybrid | Agent step logging + log viewer UI |
| US-052 | [US-052-receive-cited-agent-answer.md](./US-052-receive-cited-agent-answer.md) | 5 | Learning | Autonomous multi-step research with citations |
| US-060 | [US-060-multi-agent-research-task.md](./US-060-multi-agent-research-task.md) | 6 | Learning | Multi-agent collaboration, role specialization |
| US-061 | [US-061-see-agent-contributions.md](./US-061-see-agent-contributions.md) | 6 | Learning | Researcher → Writer handoff visibility |
| US-062 | [US-062-no-documents-found-gracefully.md](./US-062-no-documents-found-gracefully.md) | 6 | Learning | Empty retrieval handling in multi-agent flow |
| US-070 | [US-070-agent-searches-documents.md](./US-070-agent-searches-documents.md) | 7 | Learning | Function calling — searchDocuments tool |
| US-071 | [US-071-agent-calculates-numeric-answer.md](./US-071-agent-calculates-numeric-answer.md) | 7 | Learning | Function calling — calculate tool |
| US-072 | [US-072-agent-combines-search-and-calculation.md](./US-072-agent-combines-search-and-calculation.md) | 7 | Learning | Tool routing, multi-tool agent tasks |
| US-080 | [US-080-compare-rag-implementations.md](./US-080-compare-rag-implementations.md) | 8 | Learning | LangChain vs raw API — same task, two paths |
| US-081 | [US-081-view-rag-benchmark-metrics.md](./US-081-view-rag-benchmark-metrics.md) | 8 | Learning | Latency, token count, complexity comparison |
| US-090 | [US-090-graceful-degradation-when-ai-down.md](./US-090-graceful-degradation-when-ai-down.md) | 9 | Learning | Graceful degradation, fallback UX |
| US-091 | [US-091-retry-on-transient-api-failure.md](./US-091-retry-on-transient-api-failure.md) | 9 | Learning | Exponential backoff, retry middleware |
| US-092 | [US-092-retry-failed-ingestion-jobs.md](./US-092-retry-failed-ingestion-jobs.md) | 9 | Hybrid | Job queue retries + reliability patterns |
| US-100 | [US-100-view-cost-dashboard.md](./US-100-view-cost-dashboard.md) | 10 | Learning | Token counting, cost estimation |
| US-101 | [US-101-identify-high-cost-queries.md](./US-101-identify-high-cost-queries.md) | 10 | Learning | Usage budgeting, top consumers |
| US-102 | [US-102-log-every-llm-call.md](./US-102-log-every-llm-call.md) | 10 | Hybrid | usage_logs middleware + dashboard data |
| US-110 | [US-110-prompt-injection-demo.md](./US-110-prompt-injection-demo.md) | 11 | Learning | Prompt injection attack demonstration |
| US-111 | [US-111-defended-against-injection.md](./US-111-defended-against-injection.md) | 11 | Learning | Input sanitization, prompt separation |
| US-112 | [US-112-rate-limit-exceeded.md](./US-112-rate-limit-exceeded.md) | 11 | Hybrid | Rate limiting on chat/upload endpoints |
| US-120 | [US-120-end-to-end-knowledge-workflow.md](./US-120-end-to-end-knowledge-workflow.md) | 12 | Learning | Full capstone — decoupled acquire → ingest → RAG |
| US-121 | [US-121-view-original-document.md](./US-121-view-original-document.md) | 12 | Infrastructure | Presigned URL / bucket download |
| US-122 | [US-122-access-deployed-application.md](./US-122-access-deployed-application.md) | 12 | Infrastructure | Deployment, public URL, demo readiness |
| US-123 | [US-123-knowledge-owner-verifies-citations.md](./US-123-knowledge-owner-verifies-citations.md) | 12 | Hybrid | Trust & review workflow for cited answers |

---

## Recommended Implementation Order

Scenarios are numbered by week and should be implemented in ascending ID order. Within each week:

1. Complete **Infrastructure** scenarios first (Week 0, or week-specific plumbing).
2. Implement **Learning** scenarios — these map directly to article content and git tags.
3. Add **Hybrid** scenarios — they connect learning features to the broader product UX.

## Cross-Reference

| Document | Purpose |
|----------|---------|
| [REQUIREMENTS.md](../REQUIREMENTS.md) | Functional requirements FR-01–FR-17 |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | System layers, collections, flows |
| [ROADMAP.md](../ROADMAP.md) | Weekly deliverables and acceptance criteria |
| [linkedin article plan.md](../linkedin%20article%20plan.md) | Publish order and article titles |
