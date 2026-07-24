import { z } from 'zod';

export const askChatSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({
    sourceId: z.string().trim().min(1),
    question: z.string().trim().min(1).max(4000),
  }),
});

export type AskChatBody = z.infer<typeof askChatSchema>['body'];
