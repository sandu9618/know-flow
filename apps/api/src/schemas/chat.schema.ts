import { z } from 'zod';

export const askChatSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z
    .object({
      question: z.string().trim().min(1).max(4000),
      sourceId: z.string().trim().min(1).optional(),
      scope: z.enum(['source', 'library']).default('source'),
    })
    .refine((body) => body.scope === 'library' || !!body.sourceId, {
      message: 'sourceId is required when scope is source',
      path: ['sourceId'],
    }),
});

export type AskChatBody = z.infer<typeof askChatSchema>['body'];
