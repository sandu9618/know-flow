import { ObjectId, type WithId } from 'mongodb';
import { getDb } from '../clients/mongodb.client.js';
import type {
  Conversation,
  ConversationMessage,
} from '../types/conversation.types.js';

const COLLECTION = 'conversations';

type ConversationMessageDoc = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: string[];
};

type ConversationDoc = {
  sourceId: ObjectId;
  messages: ConversationMessageDoc[];
  createdAt: Date;
  updatedAt: Date;
};

function toDomain(doc: WithId<ConversationDoc>): Conversation {
  return {
    id: doc._id.toHexString(),
    sourceId: doc.sourceId.toHexString(),
    messages: doc.messages.map((message) => ({
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
      ...(message.role === 'assistant'
        ? { citations: message.citations ?? [] }
        : {}),
    })),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const conversationsRepository = {
  async findBySourceId(sourceId: string): Promise<Conversation | null> {
    if (!ObjectId.isValid(sourceId)) {
      return null;
    }

    const doc = await getDb()
      .collection<ConversationDoc>(COLLECTION)
      .findOne({ sourceId: new ObjectId(sourceId) });

    return doc ? toDomain(doc) : null;
  },

  async findById(id: string): Promise<Conversation | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const doc = await getDb()
      .collection<ConversationDoc>(COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    return doc ? toDomain(doc) : null;
  },

  async findOrCreateBySourceId(sourceId: string): Promise<Conversation> {
    if (!ObjectId.isValid(sourceId)) {
      throw new Error(`Invalid sourceId: ${sourceId}`);
    }

    const existing = await this.findBySourceId(sourceId);
    if (existing) {
      return existing;
    }

    const now = new Date();
    const sourceObjectId = new ObjectId(sourceId);
    const doc: ConversationDoc = {
      sourceId: sourceObjectId,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    try {
      const result = await getDb()
        .collection<ConversationDoc>(COLLECTION)
        .insertOne(doc);

      return toDomain({ ...doc, _id: result.insertedId });
    } catch (error: unknown) {
      // Unique index race: another request created the conversation first
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: number }).code === 11000
      ) {
        const raced = await this.findBySourceId(sourceId);
        if (raced) {
          return raced;
        }
      }

      throw error;
    }
  },

  async appendMessages(
    conversationId: string,
    messages: ConversationMessage[],
  ): Promise<Conversation | null> {
    if (!ObjectId.isValid(conversationId) || messages.length === 0) {
      return null;
    }

    const docs: ConversationMessageDoc[] = messages.map((message) => {
      if (message.role === 'assistant') {
        return {
          role: 'assistant',
          content: message.content,
          timestamp: message.timestamp,
          citations: message.citations ?? [],
        };
      }

      return {
        role: 'user',
        content: message.content,
        timestamp: message.timestamp,
      };
    });

    const result = await getDb()
      .collection<ConversationDoc>(COLLECTION)
      .findOneAndUpdate(
        { _id: new ObjectId(conversationId) },
        {
          $push: { messages: { $each: docs } },
          $set: { updatedAt: new Date() },
        },
        { returnDocument: 'after' },
      );

    return result ? toDomain(result) : null;
  },

  async ensureIndexes(): Promise<void> {
    const collection = getDb().collection<ConversationDoc>(COLLECTION);
    await collection.createIndex({ sourceId: 1 }, { unique: true });
    await collection.createIndex({ updatedAt: -1 });
  },
};
