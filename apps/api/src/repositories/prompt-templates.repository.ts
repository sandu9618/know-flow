import type { PromptPattern } from '@knowflow/prompts';
import { ObjectId, type WithId } from 'mongodb';
import { getDb } from '../clients/mongodb.client.js';
import type { CreatePromptTemplateInput, PromptTemplate } from '../types/prompt-template.types.js';

const COLLECTION = 'prompt_templates';

type PromptTemplateDoc = {
  name: string;
  pattern: PromptPattern;
  template: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
};

function toDomain(doc: WithId<PromptTemplateDoc>): PromptTemplate {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    pattern: doc.pattern,
    template: doc.template,
    variables: doc.variables,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const promptTemplatesRepository = {
  async findAll(filter: { pattern?: PromptPattern } = {}): Promise<PromptTemplate[]> {
    const query = filter.pattern ? { pattern: filter.pattern } : {};
    const docs = await getDb()
      .collection<PromptTemplateDoc>(COLLECTION)
      .find(query)
      .sort({ name: 1 })
      .toArray();

    return docs.map(toDomain);
  },

  async ensureIndexes(): Promise<void> {
    await getDb()
      .collection<PromptTemplateDoc>(COLLECTION)
      .createIndex({ name: 1 }, { unique: true });
  },

  async insert(input: CreatePromptTemplateInput & { variables: string[] }): Promise<PromptTemplate> {
    const now = new Date();
    const doc: PromptTemplateDoc = {
      name: input.name,
      pattern: input.pattern,
      template: input.template,
      variables: input.variables,
      createdAt: now,
      updatedAt: now,
    };

    const result = await getDb().collection<PromptTemplateDoc>(COLLECTION).insertOne(doc);

    return toDomain({ _id: result.insertedId, ...doc });
  },

  async updateById(
    id: string,
    fields: { name: string; pattern: PromptPattern; template: string; variables: string[] },
  ): Promise<PromptTemplate | null> {
    const result = await getDb()
      .collection<PromptTemplateDoc>(COLLECTION)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            name: fields.name,
            pattern: fields.pattern,
            template: fields.template,
            variables: fields.variables,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      );

    if (!result) {
      return null;
    }

    return toDomain(result);
  },

  async deleteById(id: string): Promise<boolean> {
    const result = await getDb()
      .collection<PromptTemplateDoc>(COLLECTION)
      .deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount === 1;
  },
};
