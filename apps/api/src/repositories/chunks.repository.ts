import { ObjectId, type WithId } from 'mongodb';
import { getDb } from '../clients/mongodb.client.js';
import type { Chunk, ChunkInput } from '../types/chunk.types.js';

const COLLECTION = 'chunks';

type ChunkDoc = {
  sourceId: ObjectId;
  index: number;
  text: string;
  tokenCount: number;
  createdAt: Date;
};

function toDomain(doc: WithId<ChunkDoc>): Chunk {
  return {
    id: doc._id.toHexString(),
    sourceId: doc.sourceId.toHexString(),
    index: doc.index,
    text: doc.text,
    tokenCount: doc.tokenCount,
    createdAt: doc.createdAt,
  };
}

export const chunksRepository = {
  async replaceForSource(sourceId: string, chunks: ChunkInput[]): Promise<number> {
    if (!ObjectId.isValid(sourceId)) {
      return 0;
    }

    const sourceObjectId = new ObjectId(sourceId);
    const collection = getDb().collection<ChunkDoc>(COLLECTION);
    const now = new Date();

    await collection.deleteMany({ sourceId: sourceObjectId });

    if (chunks.length === 0) {
      return 0;
    }

    await collection.insertMany(
      chunks.map((chunk) => ({
        sourceId: sourceObjectId,
        index: chunk.index,
        text: chunk.text,
        tokenCount: chunk.tokenCount,
        createdAt: now,
      })),
    );

    return chunks.length;
  },

  async countBySourceId(sourceId: string): Promise<number> {
    if (!ObjectId.isValid(sourceId)) {
      return 0;
    }

    return getDb()
      .collection<ChunkDoc>(COLLECTION)
      .countDocuments({ sourceId: new ObjectId(sourceId) });
  },

  async findBySourceId(sourceId: string): Promise<Chunk[]> {
    if (!ObjectId.isValid(sourceId)) {
      return [];
    }

    const docs = await getDb()
      .collection<ChunkDoc>(COLLECTION)
      .find({ sourceId: new ObjectId(sourceId) })
      .sort({ index: 1 })
      .toArray();

    return docs.map(toDomain);
  },

  async ensureIndexes(): Promise<void> {
    const collection = getDb().collection<ChunkDoc>(COLLECTION);
    await collection.createIndex({ sourceId: 1, index: 1 }, { unique: true });
  },
};
