---
name: nodejs-service-layer
description: Guides Node.js service layer design — business logic, orchestration, domain errors, and repository/client delegation. Use when creating or reviewing services in apps/api or any Express/Fastify Node.js API.
---

# Node.js Service Layer

Shared conventions (errors, envelopes, layer boundaries, transactions): [nodejs-api-shared/conventions.md](../nodejs-api-shared/conventions.md)

## Core rule

Services implement **business logic and orchestration**. They do **not** know about HTTP (`req`, `res`, status codes, headers) or route-level validation.

## Service responsibilities

| Do in service | Delegate elsewhere |
|---------------|-------------------|
| Business rules and invariants | HTTP mapping (controller) |
| Orchestrate repos, clients, queues | JSON schema validation (middleware) |
| Domain-level authorization checks | Raw DB driver calls (repository) |
| Map infrastructure errors → `AppError` | Low-level retries on HTTP/SDK (client) |
| Return domain DTOs / entities | Rate limiting, prompt sanitization (middleware) |
| Start streams / enqueue jobs | — |

## File layout (KnowFlow `apps/api`)

```
src/
├── controllers/      # HTTP adapters
├── services/         # Business logic — one file per domain area
├── repositories/     # MongoDB queries (optional but preferred)
├── clients/          # Bucket, Gemini, external HTTP SDKs
├── queues/           # BullMQ producers
├── errors/           # AppError
└── types/            # Domain DTOs (not request/response shapes)
```

- **Services** export named functions or a class — match the controller layer style.
- **Repositories** own persistence queries; services compose them.
- **Clients** wrap third-party SDKs with typed methods and retries.

## Method pattern

Every public service method should:

1. Accept a **typed input object** (not `req`).
2. Enforce business rules; throw `AppError` for expected failures.
3. Orchestrate one or more repositories/clients/queues.
4. Return a domain result — never `res` or HTTP envelopes.

See [shared examples](../nodejs-api-shared/examples.md) for `getById` and `uploadAndEnqueue`.

## Input and output

- **Input**: plain objects or domain types — `{ userId, file }`, not `Request`.
- **Output**: entities, DTOs, streams, or `{ jobId, status }` for async work.
- **Pagination**: accept `{ page, limit, filters }`; return `{ items, total }` — controller wraps in `{ data, meta }`.

## Error handling

- Throw `AppError` for **expected** domain failures (not found, conflict, forbidden, bad state).
- Let **unexpected** errors propagate — do not catch-and-replace with generic messages.
- Map infrastructure failures at the service boundary when the caller needs a domain code.

| Failure type | Service action |
|--------------|----------------|
| Entity missing | `throw new AppError(..., 404)` |
| Duplicate / conflict | `throw new AppError(..., 409)` |
| Invalid business state | `throw new AppError(..., 400)` |
| Permission denied (domain) | `throw new AppError(..., 403)` |
| SDK / network (transient) | Retry in client; surface as 502/503 if exhausted |

## Orchestration patterns

**Single-resource CRUD** — one repository call plus rule checks:

```typescript
export async function updateTitle(id: string, title: string): Promise<Document> {
  const doc = await getById(id);
  if (doc.status === 'indexing') {
    throw new AppError('DOCUMENT_BUSY', 'Cannot edit while indexing', 409);
  }
  return documentRepository.update(id, { title });
}
```

**Multi-step workflow** — sequence with clear failure semantics; use compensating actions if a later step fails after an earlier one succeeds (mark failed, clean up, rethrow `AppError`).

**Long-running / streaming** — service returns a stream or async generator; controller pipes to HTTP. See [shared examples](../nodejs-api-shared/examples.md).

## Naming conventions

| Artifact | Convention | Example |
|----------|------------|---------|
| Service file | `{domain}.service.ts` | `documents.service.ts` |
| Method | verb + domain concept | `uploadAndEnqueue`, `searchByQuery` |
| Repository | `{domain}.repository.ts` | `documents.repository.ts` |
| Client | `{provider}.client.ts` | `gemini.client.ts` |

Use domain language (`indexDocument`, `retrieveContext`), not HTTP verbs alone (`post`, `get`).

## KnowFlow-specific guidance

| Domain | Service owns |
|--------|--------------|
| **Ingestion** | Bucket upload → document record → queue job; never block on parse/embed |
| **RAG / chat** | Embed query → vector search top-k → assemble prompt → stream from Gemini |
| **Search** | Embed query → ranked chunks; no bucket reads |
| **Agents** | Orchestration loop, tool routing, step logging to `agent_runs` |
| **Cost** | Token counting and `usage_logs` writes (often via client wrapper) |

## Testing

- Unit-test services with mocked repositories/clients.
- Assert thrown `AppError` codes and status codes for failure paths.
- Integration tests hit real repos/clients sparingly — focus on orchestration contracts.

## Anti-patterns

- Importing `Request` / `Response` in services
- Returning `{ data: ... }` API envelopes from services
- Direct MongoDB/driver calls scattered across services (use repositories)
- Business rules in controllers or middleware
- Swallowing errors with `catch { return null }` without logging
- God service files (>300 lines) — split by subdomain (`chat.service`, `search.service`)
- Circular imports between services — extract shared logic to a small module or pass dependencies

## Review checklist

When creating or reviewing services:

- [ ] No HTTP types or response formatting
- [ ] Inputs are typed domain objects, not `req`
- [ ] Expected failures throw `AppError` with stable `code`
- [ ] Persistence lives in repositories; SDK calls in clients
- [ ] Multi-step flows define failure/cleanup behavior
- [ ] Async work returns job/stream handle; does not block on heavy processing
- [ ] Methods are focused; large domains split across files
- [ ] Return types are domain DTOs, not API envelopes

## Related skills

- Shared: [nodejs-api-shared](../nodejs-api-shared/conventions.md)
- Routes: [nodejs-routes-layer](../nodejs-routes-layer/SKILL.md)
- Controllers: [nodejs-controller-layer](../nodejs-controller-layer/SKILL.md)
- Repositories: [nodejs-repository-layer](../nodejs-repository-layer/SKILL.md)

## Examples

- Layer-specific: [examples.md](examples.md)
- Cross-layer patterns: [shared examples](../nodejs-api-shared/examples.md)
