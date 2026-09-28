import { ObjectId, type WithId } from 'mongodb';
import { getDb } from '../clients/mongodb.client.js';
import { EMBEDDING_DIMENSIONS } from '../constants/ingestion.constants.js';
import { CHUNKS_VECTOR_INDEX } from '../constants/search.constants.js';
import type {
  Chunk,
  ChunkEmbeddingUpdate,
  ChunkInput,
  VectorSearchHit,
} from '../types/chunk.types.js';

const COLLECTION = 'chunks';

const chunkReadOptions = {
  projection: {
    sourceId: 1,
    index: 1,
    text: 1,
    tokenCount: 1,
    createdAt: 1,
  },
} as const;

type ChunkDoc = {
  sourceId: ObjectId;
  index: number;
  text: string;
  tokenCount: number;
  embedding?: number[];
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

  async setEmbeddings(sourceId: string, updates: ChunkEmbeddingUpdate[]): Promise<void> {
    if (!ObjectId.isValid(sourceId) || updates.length === 0) {
      return;
    }

    const sourceObjectId = new ObjectId(sourceId);
    const collection = getDb().collection<ChunkDoc>(COLLECTION);
    const result = await collection.bulkWrite(
      updates.map((update) => ({
        updateOne: {
          filter: { sourceId: sourceObjectId, index: update.index },
          update: { $set: { embedding: update.embedding } },
        },
      })),
    );

    if (result.matchedCount !== updates.length) {
      throw new Error('Could not store embeddings for every chunk');
    }
  },

  async deleteBySourceId(sourceId: string): Promise<void> {
    if (!ObjectId.isValid(sourceId)) {
      return;
    }

    await getDb()
      .collection<ChunkDoc>(COLLECTION)
      .deleteMany({ sourceId: new ObjectId(sourceId) });
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
    return this.findBySourceIds([sourceId]);
  },

  async findBySourceIds(sourceIds: string[]): Promise<Chunk[]> {
    const objectIds = sourceIds
      .filter((sourceId) => ObjectId.isValid(sourceId))
      .map((sourceId) => new ObjectId(sourceId));

    if (objectIds.length === 0) {
      return [];
    }

    const docs = await getDb()
      .collection<ChunkDoc>(COLLECTION)
      .find({ sourceId: { $in: objectIds } }, chunkReadOptions)
      .sort({ sourceId: 1, index: 1 })
      .toArray();

    return docs.map(toDomain);
  },

  async findByIds(ids: string[]): Promise<Chunk[]> {
    const objectIds = ids
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    if (objectIds.length === 0) {
      return [];
    }

    const docs = await getDb()
      .collection<ChunkDoc>(COLLECTION)
      .find({ _id: { $in: objectIds } }, chunkReadOptions)
      .toArray();

    return docs.map(toDomain);
  },

  async vectorSearch(input: {
    vector: number[];
    sourceIds: string[];
    limit: number;
  }): Promise<VectorSearchHit[]> {
    const objectIds = input.sourceIds
      .filter((sourceId) => ObjectId.isValid(sourceId))
      .map((sourceId) => new ObjectId(sourceId));

    if (objectIds.length === 0 || input.limit < 1) {
      return [];
    }

    const limit = input.limit;
    const docs = await getDb()
      .collection<ChunkDoc>(COLLECTION)
      .aggregate<VectorSearchAggregateDoc>([
        {
          $vectorSearch: {
            index: CHUNKS_VECTOR_INDEX,
            path: 'embedding',
            queryVector: input.vector,
            numCandidates: Math.min(limit * 10, 200),
            limit,
            filter: { sourceId: { $in: objectIds } },
          },
        },
        {
          $project: {
            text: 1,
            sourceId: 1,
            index: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ])
      .toArray();

    return docs.map((doc) => ({
      id: doc._id.toHexString(),
      sourceId: doc.sourceId.toHexString(),
      index: doc.index,
      text: doc.text,
      score: doc.score,
    }));
  },

  async ensureIndexes(): Promise<void> {
    const collection = getDb().collection<ChunkDoc>(COLLECTION);
    await collection.createIndex({ sourceId: 1, index: 1 }, { unique: true });
  },

  async ensureVectorSearchIndex(): Promise<void> {
    const collection = getDb().collection<ChunkDoc>(COLLECTION);

    try {
      const indexes = await collection.listSearchIndexes().toArray();
      const exists = indexes.some((index) => index.name === CHUNKS_VECTOR_INDEX);
      if (exists) {
        return;
      }

      await collection.createSearchIndex({
        name: CHUNKS_VECTOR_INDEX,
        type: 'vectorSearch',
        definition: {
          fields: [
            {
              type: 'vector',
              path: 'embedding',
              numDimensions: EMBEDDING_DIMENSIONS,
              similarity: 'cosine',
            },
            {
              type: 'filter',
              path: 'sourceId',
            },
          ],
        },
      });
      console.log(`Created vector search index ${CHUNKS_VECTOR_INDEX}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `Vector search index ${CHUNKS_VECTOR_INDEX} was not created: ${message}. Semantic search requires MongoDB Atlas or mongodb/mongodb-atlas-local.`,
      );
    }
  },
};

type VectorSearchAggregateDoc = {
  _id: ObjectId;
  text: string;
  sourceId: ObjectId;
  index: number;
  score: number;
};
