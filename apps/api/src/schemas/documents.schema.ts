import { z } from 'zod';

export const listDocumentsSchema = z.object({
  query: z.object({}).optional(),
  body: z.object({}).optional(),
  params: z.object({}).optional(),
});

export type ListDocumentsQuery = z.infer<typeof listDocumentsSchema>['query'];

export const uploadDocumentSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z
    .object({
      title: z.string().trim().min(1).max(200).optional(),
    })
    .optional(),
});

export type UploadDocumentBody = z.infer<typeof uploadDocumentSchema>['body'];
