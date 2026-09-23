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

const objectIdParamSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid document id');

export const documentIdSchema = z.object({
  params: z.object({
    id: objectIdParamSchema,
  }),
});

export type DocumentIdParams = z.infer<typeof documentIdSchema>['params'];
