# Repository Layer Examples

Cross-layer patterns (`getById`, vector search): [shared examples](../nodejs-api-shared/examples.md)

## Basic CRUD

```typescript
// models/document.model.ts
import mongoose, { Schema } from 'mongoose';

const documentSchema = new Schema(
  {
    title: { type: String, required: true },
    filename: { type: String, required: true },
    bucketKey: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'indexing', 'indexed', 'failed'],
      default: 'pending',
      index: true,
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.model('Document', documentSchema);
```

```typescript
// repositories/documents.repository.ts
import { DocumentModel } from '../models/document.model';
import type { Document, CreateDocumentInput } from '../types/document';

function toDocument(doc: { _id: unknown; [key: string]: unknown }): Document {
  return {
    id: String(doc._id),
    title: doc.title as string,
    filename: doc.filename as string,
    bucketKey: doc.bucketKey as string,
    userId: String(doc.userId),
    status: doc.status as Document['status'],
    createdAt: doc.createdAt as Date,
  };
}

export async function findById(id: string): Promise<Document | null> {
  const doc = await DocumentModel.findById(id)
    .select('title filename bucketKey userId status createdAt')
    .lean()
    .exec();
  return doc ? toDocument(doc) : null;
}

export async function create(input: CreateDocumentInput): Promise<Document> {
  const doc = await DocumentModel.create(input);
  return toDocument(doc.toObject());
}

export async function softDelete(id: string): Promise<void> {
  await DocumentModel.updateOne({ _id: id }, { $set: { deletedAt: new Date() } });
}
```

## Pagination and count

```typescript
// repositories/documents.repository.ts
type FindManyFilter = {
  status?: string;
  skip: number;
  limit: number;
};

export async function findMany(filter: FindManyFilter): Promise<Document[]> {
  const query: Record<string, unknown> = { deletedAt: null };
  if (filter.status) query.status = filter.status;

  const docs = await DocumentModel.find(query)
    .sort({ createdAt: -1 })
    .skip(filter.skip)
    .limit(filter.limit)
    .select('title filename status createdAt')
    .lean()
    .exec();

  return docs.map(toDocument);
}

export async function count(filter: { status?: string }): Promise<number> {
  const query: Record<string, unknown> = { deletedAt: null };
  if (filter.status) query.status = filter.status;
  return DocumentModel.countDocuments(query).exec();
}
```

## Bulk upsert (ingestion)

```typescript
// repositories/chunks.repository.ts
import type { ClientSession } from 'mongoose';
import type { ChunkInsert } from '../types/chunk';

const BATCH_SIZE = 50;

export async function bulkUpsertChunks(
  chunks: ChunkInsert[],
  session?: ClientSession
): Promise<void> {
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const ops = batch.map((chunk) => ({
      updateOne: {
        filter: { documentId: chunk.documentId, index: chunk.index },
        update: {
          $set: {
            text: chunk.text,
            tokenCount: chunk.tokenCount,
            embedding: chunk.embedding,
          },
        },
        upsert: true,
      },
    }));
    await ChunkModel.bulkWrite(ops, { ordered: false, session });
  }
}

export async function deleteByDocumentId(documentId: string): Promise<void> {
  await ChunkModel.deleteMany({ documentId });
}
```

## Transaction-aware writes

```typescript
// services/documents.service.ts — service owns transaction
import mongoose from 'mongoose';

export async function reindexDocument(documentId: string): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await documentRepository.update(documentId, { status: 'indexing' }, session);
    await chunkRepository.deleteByDocumentId(documentId, session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

```typescript
// repositories/documents.repository.ts
export async function update(
  id: string,
  fields: Partial<Document>,
  session?: ClientSession
): Promise<Document | null> {
  const doc = await DocumentModel.findByIdAndUpdate(id, { $set: fields }, { new: true, session })
    .lean()
    .exec();
  return doc ? toDocument(doc) : null;
}
```

## Append to embedded array (conversations)

```typescript
// repositories/conversations.repository.ts
import { ConversationModel } from '../models/conversation.model';
import type { Message } from '../types/conversation';

export async function appendMessage(
  conversationId: string,
  message: Message
): Promise<void> {
  await ConversationModel.updateOne(
    { _id: conversationId },
    { $push: { messages: message }, $set: { updatedAt: new Date() } }
  );
}
```

## Bad vs good

**Bad — business rule in repository:**

```typescript
export async function deleteDocument(id: string, userId: string) {
  const doc = await DocumentModel.findById(id);
  if (!doc) throw new AppError('NOT_FOUND', 'Not found', 404);
  if (doc.userId.toString() !== userId) throw new AppError('FORBIDDEN', 'Denied', 403);
  await DocumentModel.updateOne({ _id: id }, { deletedAt: new Date() });
}
```

**Good — repository is persistence only:**

```typescript
export async function softDelete(id: string): Promise<void> {
  await DocumentModel.updateOne({ _id: id }, { $set: { deletedAt: new Date() } });
}
```

**Bad — unbounded query with embeddings:**

```typescript
export async function findByDocumentId(documentId: string) {
  return ChunkModel.find({ documentId });
}
```

**Good — projection and sort:**

```typescript
export async function findByDocumentId(documentId: string): Promise<ChunkSummary[]> {
  return ChunkModel.find({ documentId })
    .select('index text tokenCount')
    .sort({ index: 1 })
    .lean()
    .exec();
}
```

**Bad — swallow driver errors:**

```typescript
export async function findById(id: string) {
  try {
    return await DocumentModel.findById(id).lean();
  } catch {
    return null;
  }
}
```
