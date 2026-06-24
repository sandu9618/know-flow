# Service Layer Examples

Cross-layer patterns (`getById`, `uploadAndEnqueue`, vector search, streaming): [shared examples](../nodejs-api-shared/examples.md)

## CRUD with business rules

```typescript
// services/documents.service.ts
import { documentRepository } from '../repositories/documents.repository';
import { AppError } from '../errors/AppError';
import type { Document } from '../types/document';

export async function deleteDocument(id: string, userId: string): Promise<void> {
  const document = await getById(id);
  if (document.userId !== userId) {
    throw new AppError('FORBIDDEN', 'Not allowed to delete this document', 403);
  }
  if (document.status === 'indexing') {
    throw new AppError('DOCUMENT_BUSY', 'Cannot delete while indexing', 409);
  }
  await documentRepository.softDelete(id);
}
```

## Client with retries (service stays simple)

```typescript
// clients/gemini.client.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withRetry } from '../lib/withRetry';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function embed(text: string): Promise<number[]> {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }, { attempts: 3 });
}
```

## Pagination

```typescript
// services/documents.service.ts
type ListInput = { page: number; limit: number; status?: string };
type ListResult = { items: Document[]; total: number };

export async function list(input: ListInput): Promise<ListResult> {
  const limit = Math.min(input.limit, 100);
  const page = Math.max(input.page, 1);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    documentRepository.findMany({ status: input.status, skip, limit }),
    documentRepository.count({ status: input.status }),
  ]);

  return { items, total };
}
```

Controller maps to API envelope:

```typescript
const { items, total } = await documentService.list({ page, limit, status });
res.status(200).json({ data: items, meta: { page, limit, total } });
```

## Bad vs good

**Bad — HTTP in service:**

```typescript
export async function getDocument(req: Request, res: Response) {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json({ data: doc });
}
```

**Bad — persistence logic in service:**

```typescript
export async function search(query: string) {
  const embedding = await embed(query);
  return Chunk.aggregate([
    { $vectorSearch: { index: 'chunks', path: 'embedding', queryVector: embedding, limit: 10 } },
  ]);
}
```

**Good — repository owns query** (see [shared examples](../nodejs-api-shared/examples.md#vector-search-repository-owns-query-service-orchestrates)).

**Bad — silent failure:**

```typescript
export async function getById(id: string) {
  try {
    return await documentRepository.findById(id);
  } catch {
    return null;
  }
}
```
