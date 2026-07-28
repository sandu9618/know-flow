import { z } from 'zod';

export const getConversationBySourceSchema = z.object({
  query: z.object({
    sourceId: z.string().trim().min(1),
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional(),
});

export type GetConversationBySourceQuery = z.infer<
  typeof getConversationBySourceSchema
>['query'];
