import { extractVariables, isValidPattern } from '@knowflow/prompts';
import { MongoServerError } from 'mongodb';
import { AppError } from '../errors/AppError.js';
import { promptTemplatesRepository } from '../repositories/prompt-templates.repository.js';
import type { CreatePromptTemplateInput, PromptTemplate } from '../types/prompt-template.types.js';

function isDuplicateKeyError(error: unknown): boolean {
  return error instanceof MongoServerError && error.code === 11000;
}

export const promptTemplatesService = {
  async create(input: CreatePromptTemplateInput): Promise<PromptTemplate> {
    if (!isValidPattern(input.pattern)) {
      throw new AppError('VALIDATION_ERROR', 'Invalid prompt pattern', 400);
    }

    const variables = extractVariables(input.template);

    try {
      return await promptTemplatesRepository.insert({
        ...input,
        variables,
      });
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new AppError(
          'DUPLICATE_TEMPLATE_NAME',
          `A prompt template named "${input.name}" already exists`,
          409,
        );
      }

      throw error;
    }
  },
};
