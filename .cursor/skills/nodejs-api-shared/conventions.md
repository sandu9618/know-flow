# KnowFlow Node.js API — Shared Conventions

Canonical rules referenced by all layer skills and `.cursor/rules/nodejs-api.mdc`. Do not duplicate these sections in layer skills — link here instead.

## Request flow

One direction only:

```
Route → Middleware → Controller → Service → Repository / Client / Queue
                                      ↓
                            Error middleware → JSON response
```

| Layer | Owns | Must not |
|-------|------|----------|
| **Routes** | Path registration, middleware chain, `controller.method` binding | Business logic, DB/SDK calls |
| **Middleware** | Auth, validation, rate limits, logging, file/MIME checks | Domain rules, persistence |
| **Controllers** | Read `req`, call one service, map to HTTP status + JSON, `next(error)` | MongoDB, Gemini, bucket, queues |
| **Services** | Business rules, orchestration, `AppError` for expected failures | `req`/`res`, HTTP envelopes |
| **Repositories** | Queries, projections, bulk writes, vector search | Business rules, `AppError`, HTTP |
| **Clients** | SDK config, retries, timeouts (Gemini, bucket) | Domain orchestration |

## Validation

- Attach `validate(schema)` on the **route** — not inside controllers.
- Controllers assume input is already valid and typed.
- Return `400` with field-level errors from the validator middleware.

## Middleware ordering

```
1. Router-level: authenticate (if entire resource is protected)
2. Route-level: rate limiter → file parser → validate(schema) → controller
```

| Middleware | Typical placement | Purpose |
|------------|-------------------|---------|
| `authenticate` | Router or route | Set `req.user` |
| `authorize(...)` | Route | Resource-level permission |
| `rateLimiter` | Route (write/LLM endpoints) | Abuse protection |
| `upload.single('file')` | Route (before validate if schema reads `req.file`) | Multipart parsing |
| `validate(schema)` | Route (before controller) | Body/query/params → `400` |
| `controller.method` | Last in chain | HTTP adapter |

## Security and cross-cutting middleware

Keep on routes/middleware — not in controllers or services:

| Endpoint type | Middleware |
|---------------|------------|
| `/upload`, `/documents` POST | `uploadLimiter`, file size/MIME checks |
| `/chat` | `chatLimiter`, auth, prompt sanitization |
| All protected resources | `authenticate` at router level |
| Public health | No auth; minimal chain |

Controllers read `req.user` only; services enforce domain-level authorization.

## Response envelope

```typescript
// Success
{ data: T }
{ data: T[], meta: { page, limit, total } }

// Client error (from AppError or validator)
{ error: { code: string, message: string, details?: unknown } }
```

| Outcome | Status |
|---------|--------|
| OK | `200` |
| Created | `201` |
| Accepted (async job) | `202` |
| No content | `204` |
| Validation | `400` |
| Unauthorized / forbidden | `401` / `403` |
| Not found | `404` |
| Conflict | `409` |
| Rate limited | `429` |
| Server error | `500` (error middleware only) |

Never leak stack traces, raw prompts, or internal messages in production. Services return domain DTOs; controllers wrap in `{ data }`.

## Error handling

- Services throw `AppError` with `statusCode` and `code` for expected failures.
- Controllers call `next(error)` — never format `{ error }` inline for unexpected failures.
- A single `errorHandler` middleware maps errors to the response envelope and logs server errors.
- Do not catch errors only to rethrow generic messages — preserve the original error for the handler.

## REST path and handler mapping

| Verb | Path | Handler |
|------|------|---------|
| `GET` | `/documents` | `listDocuments` |
| `GET` | `/documents/:id` | `getDocument` |
| `POST` | `/documents` | `createDocument` |
| `PATCH` | `/documents/:id` | `updateDocument` |
| `DELETE` | `/documents/:id` | `deleteDocument` |
| `POST` | `/documents/:id/reindex` | `reindexDocument` |

- Plural nouns for collections; kebab-case for multi-word paths.
- File naming: `{resource}.routes.ts`, `{resource}.controller.ts`, `{resource}.service.ts`, `{resource}.repository.ts`.

## Repository vs client boundaries

| Layer | Owns |
|-------|------|
| **Repository** | Collection queries, indexes, projections, upserts, vector search pipelines |
| **Client** | SDK config, auth, retries, timeouts, response parsing |
| **Service** | Which calls to make, in what order, and what they mean |

Services orchestrate; repositories query; clients wrap third-party SDKs. No Mongoose/SQL in services; no `AppError` in repositories.

## Transactions

- **Services** start, commit, and abort transactions.
- **Repositories** accept an optional `session` parameter — they do not start transactions.

## Async and long-running work

- Heavy ingestion: enqueue job, return `202` with `{ data: { jobId, status } }` — do not block on parse/embed.
- Chat/RAG streaming: controller sets SSE headers and pipes service stream to `res`; handle `req.on('close')`.
- Follow ARCHITECTURE.md: top-k vector retrieval, batch embeddings, never load full corpus in memory.

## Async handlers

Bind controller methods with try/catch + `next(error)`, or wrap once with `asyncHandler` at the route level. Do not wrap the same handler twice.

## Shared examples

See [examples.md](examples.md) for `validate`, `AppError`, `errorHandler`, `asyncHandler`, `getById`, `uploadAndEnqueue`, vector search, and streaming chat.
