import { PROMPT_PATTERN_VALUES } from '@knowflow/prompts';
import { z } from 'zod';

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be at most 100 characters')
  .regex(
    /^[a-z0-9][a-z0-9-_]*$/i,
    'Name must start with a letter or number and contain only letters, numbers, hyphens, and underscores',
  );

const promptTemplateBodySchema = z.object({
  name: nameSchema,
  pattern: z.enum(PROMPT_PATTERN_VALUES),
  template: z
    .string()
    .trim()
    .min(1, 'Template is required')
    .max(10_000, 'Template must be at most 10,000 characters'),
});

const objectIdParamSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid template id');

export const createPromptTemplateSchema = z.object({
  body: promptTemplateBodySchema,
});

export type CreatePromptTemplateBody = z.infer<
  typeof createPromptTemplateSchema
>['body'];

export const updatePromptTemplateSchema = z.object({
  params: z.object({
    id: objectIdParamSchema,
  }),
  body: promptTemplateBodySchema,
});

export type UpdatePromptTemplateBody = z.infer<
  typeof updatePromptTemplateSchema
>['body'];

export type UpdatePromptTemplateParams = z.infer<
  typeof updatePromptTemplateSchema
>['params'];

export const listPromptTemplatesSchema = z.object({
  query: z.object({
    pattern: z.enum(PROMPT_PATTERN_VALUES).optional(),
  }),
});

export type ListPromptTemplatesQuery = z.infer<typeof listPromptTemplatesSchema>['query'];

export const deletePromptTemplateSchema = z.object({
  params: z.object({
    id: objectIdParamSchema,
  }),
});

export type DeletePromptTemplateParams = z.infer<
  typeof deletePromptTemplateSchema
>['params'];
