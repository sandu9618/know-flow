# KnowFlow — Product Requirements

## Problem Statement

Teams accumulate large document libraries (policies, specs, meeting notes, research papers) that are difficult to search and navigate. A team with 200 PDFs cannot afford to load every file into application memory for search or Q&A.

KnowFlow solves this by separating **cold storage** (cloud bucket for raw files) from **hot search** (MongoDB index of text chunks and embeddings), and by decoupling **knowledge acquisition** (how content enters the system) from **ingestion** (how it becomes searchable). Users get semantic search and AI-powered Q&A with source citations, while the system processes content incrementally from any supported channel and queries only the most relevant chunks at runtime.

**Phase 1** delivers file upload as the first knowledge source adapter. **Phase 2+** will add connectors for Jira, GitHub, Confluence, and incident reports (via MCP or equivalent), all feeding the same ingestion pipeline.

## Primary Users

- **Team members** who add knowledge from files (Phase 1) and connected tools (Phase 2+) and ask questions about internal knowledge
- **Knowledge owners** who maintain knowledge libraries and review AI-generated answers

## Core User Flows

### 1. Acquire Knowledge — File Upload (Week 2+, Phase 1)

1. User selects a file (PDF, DOCX, TXT) in the React UI.
2. Node API **acquisition layer** uploads the raw file to cloud object storage.
3. A `knowledge_sources` record is created with `sourceType: file_upload` and status `acquired`.
4. Upload completes independently of parsing, chunking, or embedding.

### 2. Ingest Knowledge Source (Week 2–4)

1. An `ingest-source` job is enqueued for the knowledge source (auto-triggered after upload in Phase 1; manual re-index or connector sync later).
2. Ingestion orchestrator loads the source record and resolves text via the appropriate adapter (bucket stream for files; MCP fetch for future connectors).
3. Worker parses text (page-by-page for large PDFs).
4. Text is split into chunks (500–1000 tokens each).
5. Chunks are embedded in batches and stored in MongoDB.
6. Source status updates to `indexed` (or `failed` with error detail).
7. Memory is released before the next source is processed.

### 3. Semantic Search (Week 4+)

1. User enters a search query in the React UI.
2. Node API embeds the query string.
3. MongoDB vector search returns top-k matching chunks with document metadata.
4. UI displays ranked snippets with links to source knowledge items.

### 4. Chat Q&A with Citations (Week 2–3+)

1. User asks a natural-language question in the chat UI.
2. (Week 3+) Relevant chunks are retrieved via RAG; (Week 2) full document text is used for a single uploaded doc.
3. Node API sends question + context to the configured LLM provider (via `LlmClient`).
4. Response is streamed to the UI with citations pointing to source chunks/knowledge sources.
5. Conversation is persisted in MongoDB.

### 5. Agent-Assisted Research (Week 5–7)

1. User submits a complex research task.
2. Single or multi-agent orchestrator retrieves facts, optionally calls tools (search, calculator).
3. Agent step logs are stored for transparency and debugging.
4. Final formatted answer is returned with citations.

### 6. Connect External Knowledge (Phase 2+, post-v1)

1. User connects Jira, GitHub, Confluence, or an incident-report system via MCP (or equivalent integration).
2. Connector adapter fetches or receives content and creates/updates `knowledge_sources` records.
3. Same `ingest-source` pipeline indexes the content — no separate RAG path per connector.

### 7. Operations & Admin (Week 9–11)

1. **Reliability (Week 9):** Failed API calls retry with backoff; UI degrades gracefully when AI is unavailable.
2. **Cost tracking (Week 10):** Token usage and estimated cost are logged per request; dashboard shows spend over time.
3. **Security (Week 11):** Prompt injection attempts are detected and blocked; rate limiting protects endpoints.

## Functional Requirements

| ID | Requirement | Week |
|----|-------------|------|
| FR-01 | CRUD for reusable prompt templates with variable substitution | 1 |
| FR-02 | React UI to select a template, fill variables, and preview the final prompt | 1 |
| FR-03 | Upload files via acquisition API; store in bucket; create `knowledge_sources` record | 2 |
| FR-03a | Decouple acquisition from ingestion — upload does not parse or embed inline | 2 |
| FR-03b | Source-agnostic `ingest-source` job enqueued after acquisition | 2–3 |
| FR-04 | Chat Q&A against ingested source text via configurable LLM provider | 2 |
| FR-05 | Chunk knowledge sources and store in MongoDB for retrieval | 3 |
| FR-06 | RAG pipeline: retrieve top-k chunks, inject into prompt, generate answer | 3 |
| FR-07 | Generate embeddings via Python service; store vectors in MongoDB | 4 |
| FR-08 | Semantic search across all indexed documents | 4 |
| FR-09 | Single-agent task runner with step logging | 5 |
| FR-10 | Multi-agent collaboration (researcher + writer) | 6 |
| FR-11 | Agent tool use via function calling (document search, calculator) | 7 |
| FR-12 | LangChain comparison path for same RAG task | 8 |
| FR-13 | Retry logic, fallback models, graceful degradation | 9 |
| FR-14 | Token counter and cost estimator dashboard | 10 |
| FR-15 | Prompt injection demo endpoint and defense middleware | 11 |
| FR-16 | End-to-end deployed capstone with README and demo | 12 |
| FR-17 | Knowledge source adapter interface; `sourceType` on all sources (connectors deferred) | 2 |

## Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Ingest one knowledge source at a time; bounded memory per worker | Peak memory ≈ one source payload + one embedding batch |
| NFR-02 | Query time loads only top-k chunks (5–10), never full corpus | No bucket reads during search |
| NFR-03 | Async job processing for ingestion, decoupled from acquisition | Queue-based `ingest-source` jobs (BullMQ or Celery) |
| NFR-04 | Retries with exponential backoff on transient LLM failures | Week 9 |
| NFR-05 | Token and cost logging on every LLM call | Week 10 |
| NFR-06 | Input sanitization and prompt injection defenses | Week 11 |
| NFR-07 | Max file size guardrail (e.g. 25 MB) | Week 2+ |
| NFR-08 | Knowledge source indexing status visible in UI (`acquired`, `indexing`, `indexed`, `failed`) | Week 3+ |

## Out of Scope (v1)

- MCP connectors for Jira, GitHub, Confluence, incident reports (Phase 2 — architecture reserved)
- Multi-tenant organization management
- Enterprise SSO (SAML, OIDC)
- Real-time collaborative editing
- Fine-tuning custom models
- Mobile native apps

These may be considered for future versions.

## Success Criteria (Capstone — Week 12)

- Upload 10+ file sources; all are indexed without memory issues
- Semantic search returns relevant results in under 2 seconds
- Chat Q&A returns cited answers grounded in uploaded content
- Agent can complete a multi-step research task using tools
- Cost dashboard shows per-session token usage
- Application is deployed and publicly demoable
- 12 weekly git tags document incremental progress
