# KnowFlow — 12-Week Roadmap

Incremental build plan for KnowFlow. Each week adds one capability to the same project, produces a publishable article, and should be tagged in git (e.g. `week-03-rag`).

Related docs: [REQUIREMENTS.md](./REQUIREMENTS.md) | [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Month 1 — Foundations

### Week 1: Prompt Engineering Patterns


|             |                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------ |
| **Learn**   | Prompt engineering patterns (zero-shot, few-shot, chain-of-thought, role-based, structured JSON) |
| **Build**   | Prompt template library in TypeScript; React picker; MongoDB CRUD                                |
| **Article** | "5 Prompt Patterns Every Developer Should Know"                                                  |
| **Git tag** | `week-01-prompts`                                                                                |


**Deliverables**

- `packages/prompts` with 5 patterns and `{{variable}}` substitution
- Node API: `GET/POST/PUT/DELETE /api/prompt-templates`
- MongoDB `prompt_templates` collection
- React UI: select pattern → fill variables → preview final prompt

**Acceptance criteria**

- [ ] All 5 patterns defined with at least one variable placeholder
- [ ] Variable substitution renders correctly in preview
- [ ] Templates persist to MongoDB and survive server restart
- [ ] No LLM or external AI integration yet

---

### Week 2: LLM API Deep Dive


|             |                                                                  |
| ----------- | ---------------------------------------------------------------- |
| **Learn**   | LLM APIs — chat, streaming, document input (via provider adapter) |
| **Build**   | File-upload knowledge source adapter; decoupled acquisition; Q&A chat against ingested text |
| **Article** | "Building a Document Q&A App with an LLM"                        |
| **Git tag** | `week-02-llm-qa`                                                 |


**Deliverables**

- **Acquisition layer** — file upload adapter stores raw files in cloud bucket
- `knowledge_sources` collection with `sourceType: file_upload` and `sourceConfig` (bucket key, mime type)
- **Decoupled ingestion trigger** — `ingest-source` job enqueued after upload (separate from upload handler)
- Text extraction (basic — full Python parser in Week 4)
- React sources UI with upload progress; list shows `acquired` status
- `LlmClient` provider adapter (default provider configurable via `LLM_PROVIDER`; e.g. Gemini for first implementation)
- React chat UI with streaming LLM responses
- `conversations` collection
- Adapter interface stub for future MCP connectors (Jira, GitHub, Confluence, incidents)

**Acceptance criteria**

- [ ] User can upload a PDF/TXT and see it listed with `acquired` status
- [ ] Upload API returns after storage only — no inline parsing or embedding
- [ ] `ingest-source` job runs separately and prepares text for chat
- [ ] User can ask questions about the uploaded source in chat
- [ ] Responses stream to the UI in real time
- [ ] Conversation history is saved in MongoDB
- [ ] No RAG yet — full source text sent as context (acceptable for single small sources)

---

### Week 3: RAG with Node.js


|             |                                                                         |
| ----------- | ----------------------------------------------------------------------- |
| **Learn**   | Retrieval Augmented Generation — chunking, retrieval, context injection |
| **Build**   | Chunk pipeline; top-k retrieval; RAG-powered chat                       |
| **Article** | "How RAG Works — and How I Built One in a Weekend"                      |
| **Git tag** | `week-03-rag`                                                           |


**Deliverables**

- Text chunking (500–1000 tokens, overlap optional)
- `chunks` collection linked to `knowledge_sources` via `sourceId`
- **Source-agnostic ingestion orchestrator** — `ingest-source` jobs work from `sourceId`, not upload paths
- Background job: acquire → enqueue ingest → chunk → store (no embeddings yet — keyword or simple match)
- RAG chat endpoint: retrieve top-k chunks → inject into prompt → LLM provider

**Acceptance criteria**

- [ ] Ingested knowledge sources are split into chunks in MongoDB
- [ ] Chat retrieves relevant chunks instead of full source text
- [ ] Answers include chunk-level citations (source title + chunk index)
- [ ] Ingestion runs asynchronously; UI shows `acquired` → `indexing` → `indexed` status
- [ ] Only one source processed per worker at a time

---

### Week 4: Embeddings and Vector Search


|             |                                                                   |
| ----------- | ----------------------------------------------------------------- |
| **Learn**   | Embeddings, vector similarity, semantic search                    |
| **Build**   | Python embedding service; MongoDB vector search; React search bar |
| **Article** | "Adding Semantic Search to Your App Without a PhD"                |
| **Git tag** | `week-04-semantic-search`                                         |


**Deliverables**

- Python FastAPI service: `/embed` endpoint, batch support
- Embedding field on `chunks`; vector index in MongoDB Atlas
- Upgrade RAG retrieval from keyword to vector search
- React semantic search page with ranked snippet results

**Acceptance criteria**

- [ ] Chunks have embedding vectors after ingestion
- [ ] Semantic search returns relevant results across multiple documents
- [ ] RAG chat uses vector retrieval for chunk selection
- [ ] Search responds in under 2 seconds for a library of 50+ chunks
- [ ] Python worker processes embeddings in batches (10–50 chunks)

---

## Month 2 — Agents and Architecture

### Week 5: AI Agent Fundamentals


|             |                                                         |
| ----------- | ------------------------------------------------------- |
| **Learn**   | Agent loop — observe, plan, act, reflect                |
| **Build**   | Single research agent with step logging                 |
| **Article** | "What is an AI Agent? A Developer's Honest Explanation" |
| **Git tag** | `week-05-single-agent`                                  |


**Deliverables**

- Agent orchestrator in Node.js
- Research agent: receive question → retrieve docs → summarize → return cited answer
- `agent_runs` collection with step-by-step logs
- React UI to view agent run steps

**Acceptance criteria**

- [ ] Agent completes a multi-step research task autonomously
- [ ] Each step (retrieve, reason, respond) is logged in `agent_runs`
- [ ] UI displays agent steps in chronological order
- [ ] Final answer includes citations

---

### Week 6: Multi-Agent Architectures


|             |                                                        |
| ----------- | ------------------------------------------------------ |
| **Learn**   | Multi-agent collaboration, role specialization         |
| **Build**   | Researcher agent + Writer agent with orchestrator      |
| **Article** | "I Built a Multi-Agent System — Here's What I Learned" |
| **Git tag** | `week-06-multi-agent`                                  |


**Deliverables**

- Researcher agent: finds and extracts facts from documents
- Writer agent: formats facts into a polished, cited response
- Orchestrator coordinates handoff between agents

**Acceptance criteria**

- [ ] Researcher output is passed to Writer as structured input
- [ ] Each agent's steps are logged separately in `agent_runs`
- [ ] User sees which agent produced which part of the answer
- [ ] System handles case where Researcher finds no relevant documents

---

### Week 7: Tool Use and Function Calling


|             |                                                                       |
| ----------- | --------------------------------------------------------------------- |
| **Learn**   | Function calling, tool routing, agent capabilities                    |
| **Build**   | Agent with tools: `searchDocuments`, `calculate`, optional `fetchWeb` |
| **Article** | "Giving Your AI Agent Real Tools With Function Calling"               |
| **Git tag** | `week-07-tools`                                                       |


**Deliverables**

- Tool definitions registered with LLM function calling (via active provider adapter)
- Tool router in Node.js executes tool calls and returns results to agent
- At minimum: document search and calculator tools

**Acceptance criteria**

- [ ] Agent invokes `searchDocuments` when it needs retrieval
- [ ] Agent invokes `calculate` for numeric questions
- [ ] Tool call inputs and outputs are logged in `agent_runs`
- [ ] Agent produces correct answer for a question requiring both search and calculation

---

### Week 8: LangChain vs Raw API


|             |                                                          |
| ----------- | -------------------------------------------------------- |
| **Learn**   | LangChain / LlamaIndex abstractions vs direct API calls  |
| **Build**   | Parallel Python LangChain RAG path; comparison benchmark |
| **Article** | "LangChain vs Raw API — Which Should You Use?"           |
| **Git tag** | `week-08-langchain-compare`                              |


**Deliverables**

- LangChain-based RAG pipeline in Python (same task as Node RAG)
- Benchmark script: latency, token count, lines of code
- React or CLI comparison view

**Acceptance criteria**

- [ ] Both paths (Node raw API vs Python LangChain) answer the same test questions
- [ ] Benchmark metrics are recorded and displayed
- [ ] Article-ready comparison table: speed, complexity, flexibility, cost

---

## Month 3 — Production and Capstone

### Week 9: Error Handling and Reliability


|             |                                                            |
| ----------- | ---------------------------------------------------------- |
| **Learn**   | Retries, fallbacks, circuit breakers, graceful degradation |
| **Build**   | Retry middleware, fallback model, degraded UI mode         |
| **Article** | "Making AI Apps Production-Ready"                          |
| **Git tag** | `week-09-reliability`                                      |


**Deliverables**

- Exponential backoff retry on LLM API failures (429, 500, timeout)
- Fallback to secondary model when primary is unavailable
- UI shows "AI unavailable — showing search results only" when LLM is down
- Job queue retries for failed ingestion

**Acceptance criteria**

- [ ] Simulated API failure triggers retry and eventual success or fallback
- [ ] Chat degrades gracefully without crashing the UI
- [ ] Failed ingestion jobs retry up to 3 times before marking source `failed`
- [ ] Errors are logged with enough detail to debug

---

### Week 10: Cost Optimization and Token Management


|             |                                                        |
| ----------- | ------------------------------------------------------ |
| **Learn**   | Token counting, cost estimation, usage budgeting       |
| **Build**   | Token counter middleware; `usage_logs`; cost dashboard |
| **Article** | "How to Stop Burning Money on LLM API Calls"           |
| **Git tag** | `week-10-cost-tracking`                                |


**Deliverables**

- Middleware logs `promptTokens`, `completionTokens`, `estimatedCostUsd` per request
- `usage_logs` collection
- React dashboard: total spend, spend per day, top endpoints

**Acceptance criteria**

- [ ] Every LLM call records token usage in `usage_logs`
- [ ] Dashboard shows cumulative and daily cost estimates
- [ ] User can see which queries consumed the most tokens
- [ ] Article includes real cost data from development usage

---

### Week 11: Security in AI Apps


|             |                                                              |
| ----------- | ------------------------------------------------------------ |
| **Learn**   | Prompt injection attacks and defenses                        |
| **Build**   | Injection demo endpoint; input sanitization; rate limiting   |
| **Article** | "Prompt Injection — What It Is and How to Defend Against It" |
| **Git tag** | `week-11-security`                                           |


**Deliverables**

- Demo endpoint showing successful injection without defenses
- Defense middleware: input sanitization, system/user prompt separation, output validation
- Rate limiting on `/chat` and `/upload`

**Acceptance criteria**

- [ ] Demo shows injection bypassing naive prompt assembly
- [ ] Defended path blocks or neutralizes the same injection attempt
- [ ] Rate limiter returns 429 after threshold exceeded
- [ ] Article documents attack vector and defense with code snippets

---

### Week 12: Capstone — Ship It


|             |                                                                  |
| ----------- | ---------------------------------------------------------------- |
| **Learn**   | Deployment, documentation, demo preparation                      |
| **Build**   | End-to-end polish, deploy, README, demo video                    |
| **Article** | "I Spent 3 Months Learning AI Integration — Here's What I Built" |
| **Git tag** | `week-12-capstone`                                               |


**Deliverables**

- Deployed app (Railway / Render + MongoDB Atlas + cloud bucket)
- Comprehensive README with architecture diagram and setup instructions
- Demo video or GIF walkthrough
- All 12 git tags present and documented

**Acceptance criteria**

- [ ] Public URL serves the full application
- [ ] Upload → index → search → chat → agent flow works end-to-end
- [ ] Cost dashboard and security defenses are live
- [ ] README links to all weekly tags
- [ ] Capstone article published with architecture diagram and lessons learned

---

## Weekly Time Budget


| Activity                         | Hours |
| -------------------------------- | ----- |
| Learning (courses, docs, videos) | 2–3   |
| Building                         | 2–3   |
| Writing article                  | 2–3   |
| LinkedIn posts + engagement      | 0.5–1 |


**Total:** 6–10 hours per week

## Article Writing Structure

Each article should follow this format (800–1,500 words):

1. **Hook** — relatable problem or surprising fact
2. **What you'll learn** — set expectations
3. **The concept** — explain simply
4. **The code** — real, working snippets from that week's tag
5. **What went wrong** — honest mistakes
6. **Key takeaways** — 3 bullet points max

---

## Post-Roadmap: Knowledge Connectors (Phase 2)

After the 12-week capstone, extend acquisition with MCP-backed adapters. Not part of weekly tags.

| Connector | Content examples | Ingestion path |
|-----------|------------------|----------------|
| Jira | Issues, comments, epics | Same `ingest-source` job |
| GitHub | PRs, issues, READMEs | Same `ingest-source` job |
| Confluence | Pages, spaces | Same `ingest-source` job |
| Incident reports | Postmortems, timelines | Same `ingest-source` job |

Prerequisites from Phase 1: `knowledge_sources` schema, adapter registry, decoupled ingestion queue.

