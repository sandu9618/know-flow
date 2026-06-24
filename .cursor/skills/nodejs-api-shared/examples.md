# KnowFlow Node.js API — Shared Examples

Cross-layer patterns referenced by layer-specific `examples.md` files.

## validate middleware

```typescript
// middleware/validate.ts (called from routes only)
import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request',
          details: result.error.flatten(),
        },
      });
      return;
    }

    Object.assign(req, result.data);
    next();
  };
}
```

## AppError + errorHandler

```typescript
// errors/AppError.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../lib/logger';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
}
```

## asyncHandler

```typescript
// lib/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

// Usage on route
router.get('/:id', asyncHandler(documentsController.getDocument));
```

## getById (service throws, repository returns null)

```typescript
// repositories/documents.repository.ts
export async function findById(id: string): Promise<Document | null> {
  return DocumentModel.findById(id)
    .select('title filename status userId createdAt')
    .lean()
    .exec();
}
```

```typescript
// services/documents.service.ts
export async function getById(id: string): Promise<Document> {
  const document = await documentRepository.findById(id);
  if (!document) {
    throw new AppError('DOCUMENT_NOT_FOUND', 'Document not found', 404);
  }
  return document;
}
```

## uploadAndEnqueue (controller + service)

```typescript
// controllers/documents.controller.ts
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

```typescript
// services/documents.service.ts
export async function uploadAndEnqueue(input: UploadInput): Promise<UploadResult> {
  if (!input.file?.buffer?.length) {
    throw new AppError('FILE_REQUIRED', 'No file uploaded', 400);
  }

  const storageKey = await bucketClient.upload({
    buffer: input.file.buffer,
    filename: input.file.originalname,
    mimeType: input.file.mimetype,
  });

  const document = await documentRepository.create({
    storageKey,
    userId: input.userId,
    filename: input.file.originalname,
    mimeType: input.file.mimetype,
    sizeBytes: input.file.size,
    status: 'pending',
  });

  try {
    await ingestionQueue.add('ingest', { documentId: document.id });
  } catch {
    await documentRepository.update(document.id, {
      status: 'failed',
      errorMessage: 'Failed to enqueue ingestion job',
    });
    throw new AppError('INGESTION_ENQUEUE_FAILED', 'Could not start processing', 503);
  }

  return { documentId: document.id, status: 'pending' };
}
```

## Vector search (repository owns query, service orchestrates)

```typescript
// repositories/chunks.repository.ts
export async function vectorSearch(input: VectorSearchInput): Promise<SearchResult[]> {
  const pipeline = [
    {
      $vectorSearch: {
        index: 'chunks_vector_index',
        path: 'embedding',
        queryVector: input.vector,
        numCandidates: Math.min(input.limit * 10, 200),
        limit: input.limit,
        ...(input.filter ? { filter: input.filter } : {}),
      },
    },
    { $project: { text: 1, documentId: 1, score: { $meta: 'vectorSearchScore' } } },
  ];
  return ChunkModel.aggregate(pipeline).exec();
}
```

```typescript
// services/search.service.ts
export async function searchByQuery(input: SearchInput): Promise<SearchResult[]> {
  const limit = Math.min(input.limit ?? 10, 20);
  const queryVector = await embeddingClient.embed(input.query);
  return chunkRepository.vectorSearch({
    vector: queryVector,
    limit,
    filter: input.documentIds ? { documentId: { $in: input.documentIds } } : undefined,
  });
}
```

## Streaming chat

```typescript
// controllers/chat.controller.ts
export async function streamChat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.flushHeaders();

    const stream = await chatService.createAnswerStream({
      question: req.body.question,
      conversationId: req.body.conversationId,
      userId: req.user!.id,
    });

    req.on('close', () => stream.destroy());

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    res.end();
  } catch (error) {
    next(error);
  }
}
```

```typescript
// services/chat.service.ts
export async function createAnswerStream(input: ChatInput): Promise<AsyncIterable<ChatChunk>> {
  const contextChunks = await chunkRepository.vectorSearch({
    vector: await embeddingClient.embed(input.question),
    limit: 8,
  });
  return geminiClient.streamAnswer({ question: input.question, context: contextChunks });
}
```
