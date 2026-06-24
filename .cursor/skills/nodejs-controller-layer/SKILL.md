---
name: nodejs-controller-layer
description: Guides Express controller design — thin HTTP handlers, service delegation, validation, error handling, and consistent responses. Use when creating or reviewing controllers, routes, or HTTP handlers in apps/api or any Express Node.js API.
---

# Node.js Controller Layer (Express)

Shared conventions (validation, envelopes, errors, security, async): [nodejs-api-shared/conventions.md](../nodejs-api-shared/conventions.md)

## Core rule

Controllers translate HTTP ↔ application calls. They do **not** contain business logic, database queries, or external API calls.

## Controller responsibilities

| Do in controller | Delegate to service/middleware |
|------------------|-------------------------------|
| Read `req` (params, query, body, user) | Business rules and orchestration |
| Call one service method | MongoDB, bucket, queue, Gemini calls |
| Map result to HTTP status + JSON | Retries, token counting, injection defense |
| Call `next(error)` on failure | Chunking, embedding, agent steps |

## File layout (KnowFlow `apps/api`)

```
src/
├── routes/           # Wire paths + middleware only
├── controllers/      # One file per resource (documents, chat, search)
├── services/         # Business logic
├── middleware/       # validate, auth, rateLimit, errorHandler
└── types/            # Request/response DTOs
```

- **Routes** register paths and middleware chains; avoid inline handler logic beyond `controller.method`.
- **Controllers** export named handler functions or a class with bound methods — pick one style per project and stay consistent.

## Handler pattern

Every async controller must:

1. Extract and narrow input (types or validated DTO).
2. Call exactly one service (or a clearly named orchestrator).
3. Return a typed response with the correct status code.
4. Forward errors via `next(error)` — never swallow or `res.status(500).json()` inline for unexpected failures.

```typescript
export async function getDocument(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const document = await documentService.getById(req.params.id);
    res.status(200).json({ data: document });
  } catch (error) {
    next(error);
  }
}
```

## Streaming and long-running work

- **Chat/RAG streaming**: set SSE headers, delegate stream to service, pipe to `res`; handle `req.on('close')`.
- **Heavy ingestion**: return `202` after service enqueues — do not block on parsing or embedding.

See [shared examples](../nodejs-api-shared/examples.md) for streaming chat and `uploadAndEnqueue`.

## Naming conventions

| Artifact | Convention | Example |
|----------|--------------|---------|
| Controller file | `{resource}.controller.ts` | `documents.controller.ts` |
| Handler | verb + resource | `uploadDocument`, `searchDocuments` |

## Anti-patterns

- Database or `fetch` calls inside controller handlers
- Multiple unrelated service calls with branching business rules
- Different JSON shapes per endpoint
- `console.log` for request logging — use structured logger in middleware
- Sending response after `next(error)` or calling `res.json` twice
- `any` for `req.body` when a schema exists
- Validation or auth logic in handlers (belongs on routes/middleware)

## Review checklist

When creating or reviewing controllers:

- [ ] Handler is thin (< ~15 lines); logic lives in service
- [ ] Input validated on route, not in handler
- [ ] Errors passed to `next(error)`
- [ ] Response uses standard envelope (see shared conventions)
- [ ] Correct HTTP status for each outcome
- [ ] Async errors handled (wrapper or try/catch)
- [ ] No secrets, raw prompts, or stack traces in responses
- [ ] Streaming/upload endpoints follow non-blocking patterns

## Related skills

- Shared: [nodejs-api-shared](../nodejs-api-shared/conventions.md)
- Routes: [nodejs-routes-layer](../nodejs-routes-layer/SKILL.md)
- Services: [nodejs-service-layer](../nodejs-service-layer/SKILL.md)
- Repositories: [nodejs-repository-layer](../nodejs-repository-layer/SKILL.md)

## Examples

- Layer-specific: [examples.md](examples.md)
- Cross-layer patterns: [shared examples](../nodejs-api-shared/examples.md)
