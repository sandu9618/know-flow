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

export const createPromptTemplateSchema = z.object({
  body: z.object({
    name: nameSchema,
    pattern: z.enum(PROMPT_PATTERN_VALUES),
    template: z
      .string()
      .trim()
      .min(1, 'Template is required')
      .max(10_000, 'Template must be at most 10,000 characters'),
  }),
});

export type CreatePromptTemplateBody = z.infer<
  typeof createPromptTemplateSchema
>['body'];
