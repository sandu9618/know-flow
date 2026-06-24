# Controller Layer Examples

Cross-layer patterns (`AppError`, `errorHandler`, `asyncHandler`, `uploadAndEnqueue`, streaming): [shared examples](../nodejs-api-shared/examples.md)

## Thin controller (delegates to service)

```typescript
// controllers/documents.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as documentService from '../services/documents.service';

export async function createDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await documentService.uploadAndEnqueue({
      file: req.file,
      userId: req.user!.id,
    });
    res.status(202).json({ data: result });
  } catch (error) {
    next(error);
  }
}
```

## Bad vs good

**Bad — fat controller:**

```typescript
export async function createDocument(req, res) {
  const file = req.file;
  const key = `docs/${Date.now()}-${file.originalname}`;
  await s3.upload({ Bucket: 'knowflow', Key: key, Body: file.buffer });
  const doc = await Document.create({ key, status: 'pending' });
  await queue.add('ingest', { id: doc._id });
  res.json(doc);
}
```

**Good — thin controller:**

```typescript
export async function createDocument(req, res, next) {
  try {
    const data = await documentService.uploadAndEnqueue({
      file: req.file,
      userId: req.user.id,
    });
    res.status(202).json({ data });
  } catch (error) {
    next(error);
  }
}
```
