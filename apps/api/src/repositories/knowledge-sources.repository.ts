import { ObjectId, type WithId } from 'mongodb';
import { getDb } from '../clients/mongodb.client.js';
import type {
  CreateFileUploadSourceInput,
  FileUploadSourceConfig,
  KnowledgeSource,
  KnowledgeSourceStatus,
  KnowledgeSourceType,
} from '../types/knowledge-source.types.js';

const COLLECTION = 'knowledge_sources';

type KnowledgeSourceDoc = {
  sourceType: KnowledgeSourceType;
  title: string;
  status: KnowledgeSourceStatus;
  sourceConfig: FileUploadSourceConfig;
  errorMessage: string | null;
  chunkCount: number | null;
  createdAt: Date;
  acquiredAt: Date | null;
  indexedAt: Date | null;
};

function toDomain(doc: WithId<KnowledgeSourceDoc>): KnowledgeSource {
  return {
    id: doc._id.toHexString(),
    sourceType: doc.sourceType,
    title: doc.title,
    status: doc.status,
    sourceConfig: doc.sourceConfig,
    errorMessage: doc.errorMessage,
    chunkCount: doc.chunkCount,
    createdAt: doc.createdAt,
    acquiredAt: doc.acquiredAt,
    indexedAt: doc.indexedAt,
  };
}

export const knowledgeSourcesRepository = {
  async findAll(): Promise<KnowledgeSource[]> {
    const docs = await getDb()
      .collection<KnowledgeSourceDoc>(COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(toDomain);
  },

  async findById(id: string): Promise<KnowledgeSource | null> {
    const doc = await getDb()
      .collection<KnowledgeSourceDoc>(COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    return doc ? toDomain(doc) : null;
  },

  async insertFileUpload(input: CreateFileUploadSourceInput): Promise<KnowledgeSource> {
    const now = new Date();
    const doc: KnowledgeSourceDoc = {
      sourceType: 'file_upload',
      title: input.title,
      status: 'acquired',
      sourceConfig: input.sourceConfig,
      errorMessage: null,
      chunkCount: null,
      createdAt: now,
      acquiredAt: now,
      indexedAt: null,
    };

    const result = await getDb()
      .collection<KnowledgeSourceDoc>(COLLECTION)
      .insertOne({ _id: new ObjectId(input.id), ...doc });

    return toDomain({ _id: result.insertedId, ...doc });
  },

  async updateStatus(
    id: string,
    status: KnowledgeSourceStatus,
    errorMessage: string | null = null,
  ): Promise<KnowledgeSource | null> {
    const result = await getDb()
      .collection<KnowledgeSourceDoc>(COLLECTION)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status, errorMessage } },
        { returnDocument: 'after' },
      );

    return result ? toDomain(result) : null;
  },

  async deleteById(id: string): Promise<boolean> {
    const result = await getDb()
      .collection<KnowledgeSourceDoc>(COLLECTION)
      .deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount === 1;
  },

  async ensureIndexes(): Promise<void> {
    const collection = getDb().collection<KnowledgeSourceDoc>(COLLECTION);
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ status: 1 });
  },
};
