---
name: nodejs-routes-layer
description: Guides Express route design — path registration, middleware chains, controller binding, validation, and security wiring. Use when creating or reviewing routes, routers, or API endpoint wiring in apps/api or any Express Node.js API.
---

# Node.js Routes Layer (Express)

Shared conventions (validation order, middleware, envelopes, errors): [nodejs-api-shared/conventions.md](../nodejs-api-shared/conventions.md)

## Core rule

Routes **declare HTTP surface area** — paths, middleware order, and controller binding. They do **not** contain business logic, database calls, or response formatting beyond wiring.

## Route responsibilities

| Do in routes | Delegate elsewhere |
|--------------|-------------------|
| Register paths and HTTP verbs | Business rules (service) |
| Order middleware (see shared conventions) | DB/SDK calls (repository/client) |
| Bind `controller.method` | Status codes and JSON envelopes (controller) |
| Apply resource-scoped middleware (upload, SSE) | Domain errors (service → `AppError`) |
| Export a `Router` for mounting | Error response formatting (error middleware) |

## File layout (KnowFlow `apps/api`)

```
src/
├── routes/
│   ├── index.ts              # Mount all resource routers under /api/v1
│   ├── documents.routes.ts
│   ├── chat.routes.ts
│   └── search.routes.ts
├── controllers/
├── middleware/               # validate, auth, rateLimit, upload, errorHandler
└── schemas/                  # Zod/Joi schemas for validate()
```

- **One file per resource** — `{resource}.routes.ts`.
- **index.ts** mounts routers with a version prefix; individual route files stay resource-focused.
- Routes import controllers and middleware only — never services or repositories.

## Router pattern

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as documentsController from '../controllers/documents.controller';
import { createDocumentSchema } from '../schemas/documents.schema';

const router = Router();

router.use(authenticate);

router.get('/', documentsController.listDocuments);
router.get('/:id', documentsController.getDocument);
router.post('/', validate(createDocumentSchema), documentsController.createDocument);

export default router;
```

Mount in `routes/index.ts`:

```typescript
import { Router } from 'express';
import documentsRoutes from './documents.routes';

const router = Router();
router.use('/documents', documentsRoutes);

export default router;
```

App entry:

```typescript
import routes from './routes';
app.use('/api/v1', routes);
app.use(errorHandler);
```

## REST path conventions

- Use **plural nouns** for collections (`/documents`, not `/document`).
- Use **kebab-case** for multi-word paths (`/agent-runs`).
- Prefer **nouns** in paths; use `POST` for actions (`/reindex`, `/search`) when not CRUD.
- Keep param names consistent: `:id`, `:documentId` — match validation schema keys.

Handler naming and verb mapping: see [shared conventions](../nodejs-api-shared/conventions.md#rest-path-and-handler-mapping).

## Validation on routes

Attach schemas at the route — not inside controllers:

```typescript
router.post(
  '/',
  uploadLimiter,
  upload.single('file'),
  validate(createDocumentSchema),
  documentsController.createDocument
);
```

## KnowFlow-specific routes

| Resource | Notes |
|----------|-------|
| `POST /documents` | `uploadLimiter` + multer + validate; returns `202` (async ingest) |
| `POST /chat` | Rate limit + auth; may use SSE — no extra JSON middleware after stream starts |
| `POST /search` | Validate query body; read-only, still rate-limit |
| `GET /health` | No auth; mount outside versioned API or on root router |

## Naming conventions

| Artifact | Convention | Example |
|----------|------------|---------|
| Route file | `{resource}.routes.ts` | `documents.routes.ts` |
| Mount path | plural kebab-case | `/documents`, `/agent-runs` |
| Export | `default router` | `export default router` |
| Param | camelCase after `:` | `:documentId` |

## Anti-patterns

- Fat inline route handlers with service/repo calls
- `router.get('/:id', async (req, res) => { const doc = await Document.findById(...) })`
- Validation inside controller instead of `validate()` on route
- Wrong middleware order (controller before `authenticate` or `validate`)
- Mounting unversioned breaking changes on `/api` without a version prefix
- Mixing `router.use(authenticate)` and per-route auth inconsistently within one resource
- Importing `mongoose` or SDK clients in route files

## Review checklist

When creating or reviewing routes:

- [ ] File only wires paths, middleware, and `controller.method`
- [ ] No service/repository imports or business logic
- [ ] `authenticate` / `authorize` applied before protected handlers
- [ ] `validate(schema)` runs before controller on mutating routes
- [ ] Rate limits on `/upload`, `/chat`, and other expensive endpoints
- [ ] REST paths use plural nouns and consistent param names
- [ ] Router exported and mounted under `/api/v1` (or project version)
- [ ] Middleware order per shared conventions
- [ ] Async errors reach error middleware (handler or `asyncHandler`)
- [ ] No inline response formatting or error swallowing

## Related skills

- Shared: [nodejs-api-shared](../nodejs-api-shared/conventions.md)
- Controllers: [nodejs-controller-layer](../nodejs-controller-layer/SKILL.md)
- Services: [nodejs-service-layer](../nodejs-service-layer/SKILL.md)
- Repositories: [nodejs-repository-layer](../nodejs-repository-layer/SKILL.md)

## Examples

- Layer-specific: [examples.md](examples.md)
- Cross-layer patterns: [shared examples](../nodejs-api-shared/examples.md)
