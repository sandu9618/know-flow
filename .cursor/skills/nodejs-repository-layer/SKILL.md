---
name: nodejs-repository-layer
description: Guides Node.js repository layer design — persistence queries, projections, indexes, vector search, and data mapping. Use when creating or reviewing repositories, MongoDB queries, or data access code in apps/api or any Express Node.js API.
---

# Node.js Repository Layer

Shared conventions (layer boundaries, transactions): [nodejs-api-shared/conventions.md](../nodejs-api-shared/conventions.md)

## Core rule

Repositories own **how data is read and written**. They do **not** contain business rules, HTTP concerns, or third-party SDK orchestration (Gemini, bucket, queues).

## Repository responsibilities

| Do in repository | Delegate elsewhere |
|------------------|-------------------|
| CRUD and query construction | Business rules (service) |
| Projections, sorting, pagination at DB level | `AppError` for not-found (service) |
| Upserts, bulk writes, aggregation pipelines | Embedding generation (client) |
| Vector search queries | Authorization decisions (service) |
| Map documents → domain types | Retries on external APIs (client) |
| Accept optional session/transaction context | HTTP status codes (controller) |

## File layout (KnowFlow `apps/api`)

```
src/
├── services/         # Business logic
├── repositories/     # One file per collection/domain
├── models/           # Mongoose schemas (or driver types)
├── clients/          # Gemini, bucket, external SDKs
└── types/            # Domain entities (plain TypeScript)
```

- **Models** define schema, indexes, and hooks — not query logic.
- **Repositories** export named functions (or a thin class) that call models.
- **Types** are plain interfaces used by services — repositories return these, not `Document` instances.

## Method pattern

Every repository function should:

1. Accept **typed filters/inputs** — plain objects, not `req`.
2. Use **explicit projections** — never return full documents with embeddings unless needed.
3. Return **domain types** or `null` for single-entity lookups (service throws `AppError`).
4. Let **unexpected** driver errors propagate — do not catch and return `null`.

```typescript
export async function findById(id: string): Promise<Document | null> {
  return DocumentModel.findById(id)
    .select('title filename status userId createdAt')
    .lean()
    .exec();
}
```

## Return types and mapping

| Lookup result | Repository returns | Service handles |
|---------------|-------------------|-----------------|
| Single entity | `T \| null` | Throw `AppError` if null |
| List | `T[]` | Empty array is valid |
| Count | `number` | — |
| Create/update | `T` or `void` | Validate preconditions before call |
| Delete | `boolean` or `void` | Interpret deleted count if needed |

Map `_id` → `id` in the repository or a shared `toDomain()` helper — pick one approach per project and stay consistent.

## Query design

**Always use `.lean()`** for read paths unless you need Mongoose document methods.

**Projections** — exclude heavy fields by default:

```typescript
// Good — chunks list without embeddings
.select('documentId index text tokenCount')

// Bad — returns 1536-dim vectors for every row
.find({ documentId })
```

**Pagination** — push `skip`/`limit` to the database:

```typescript
export async function findMany(filter: {
  status?: string;
  skip: number;
  limit: number;
}): Promise<Document[]> {
  const query: FilterQuery<DocumentDoc> = { deletedAt: null };
  if (filter.status) query.status = filter.status;

  return DocumentModel.find(query)
    .sort({ createdAt: -1 })
    .skip(filter.skip)
    .limit(filter.limit)
    .select('title status createdAt')
    .lean()
    .exec();
}
```

**Indexes** — define in model/schema; repositories document required indexes in comments when queries are non-obvious.

## Vector search (KnowFlow `chunks`)

Repositories own the `$vectorSearch` pipeline — services pass the query vector and filters. See [shared examples](../nodejs-api-shared/examples.md).

Never load all chunks into memory for similarity — always use the vector index or a bounded query.

## Writes

| Operation | Pattern |
|-----------|---------|
| Create | `create()` or `insertOne()`; return mapped domain type |
| Update | `updateOne` / `findByIdAndUpdate` with `$set`; avoid full replace |
| Upsert chunks | `bulkWrite` with ordered `false` for ingestion batches |
| Soft delete | `updateOne({ _id }, { deletedAt: new Date() })` |
| Hard delete | `deleteOne` / `deleteMany` — use only when service confirms |

```typescript
export async function bulkUpsertChunks(
  chunks: ChunkInsert[],
  session?: ClientSession
): Promise<void> {
  const ops = chunks.map((chunk) => ({
    updateOne: {
      filter: { documentId: chunk.documentId, index: chunk.index },
      update: { $set: chunk },
      upsert: true,
    },
  }));
  await ChunkModel.bulkWrite(ops, { ordered: false, session });
}
```

## Naming conventions

| Artifact | Convention | Example |
|----------|------------|---------|
| Repository file | `{domain}.repository.ts` | `documents.repository.ts` |
| Model file | `{domain}.model.ts` | `document.model.ts` |
| Function | verb + scope | `findById`, `findMany`, `vectorSearch`, `bulkUpsertChunks` |
| Filter type | `{Domain}Filter` or inline object | `DocumentFilter` |

Use persistence language (`findById`, `softDelete`), not HTTP verbs (`get`, `post`).

## KnowFlow-specific guidance

| Collection | Repository focus |
|------------|------------------|
| `documents` | Status transitions as plain updates; exclude `bucketKey` from list projections when not needed |
| `chunks` | Batch upsert during ingestion; vector search with `documentId` filter; never `find()` all chunks |
| `conversations` | Append messages with `$push`; paginate message history for long threads |
| `agent_runs` | Append steps with `$push`; index by `status` for dashboards |
| `usage_logs` | Insert-only; time-range queries with `createdAt` index |
| `prompt_templates` | Simple CRUD; index `name` for lookup |

## Testing

- Unit-test repositories against an in-memory MongoDB or test container when integration coverage is needed.
- Mock repositories in **service** unit tests — do not mock the driver inside repository tests.
- Assert query shape (filter, projection) for complex aggregations via spy on `Model.aggregate`.

## Anti-patterns

- Throwing `AppError` from repositories (couples persistence to HTTP semantics)
- Returning Mongoose documents to services (use `.lean()` + domain mapping)
- Business logic (`if status === 'indexing'`) in repository functions
- `find()` without limit on unbounded collections
- Selecting `embedding` field in list/browse queries
- Loading all chunks/documents for in-memory vector similarity at scale
- Scattering `Model.find` calls across services instead of centralizing in repos
- `catch { return null }` on driver errors — masks infrastructure failures
- N+1 queries in loops — use `$in`, aggregation, or `bulkWrite`

## Review checklist

When creating or reviewing repositories:

- [ ] No business rules or `AppError` throws
- [ ] Returns domain types via `.lean()` (or explicit mapping)
- [ ] Projections exclude heavy fields (embeddings, large arrays) unless required
- [ ] Pagination uses `skip`/`limit` at DB level
- [ ] Vector search uses index pipeline, not in-memory scan
- [ ] Bulk ingestion uses `bulkWrite` with bounded batch sizes
- [ ] Transaction session passed through when service orchestrates multi-write flows
- [ ] Indexes documented or defined on model for non-trivial queries
- [ ] No HTTP types, SDK clients, or queue producers imported

## Related skills

- Shared: [nodejs-api-shared](../nodejs-api-shared/conventions.md)
- Routes: [nodejs-routes-layer](../nodejs-routes-layer/SKILL.md)
- Controllers: [nodejs-controller-layer](../nodejs-controller-layer/SKILL.md)
- Services: [nodejs-service-layer](../nodejs-service-layer/SKILL.md)

## Examples

- Layer-specific: [examples.md](examples.md)
- Cross-layer patterns: [shared examples](../nodejs-api-shared/examples.md)
