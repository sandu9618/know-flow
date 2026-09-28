import { z } from 'zod';
import {
  SEARCH_MAX_LIMIT,
  SEARCH_QUERY_MAX_CHARS,
  SEARCH_TOP_K,
} from '../constants/search.constants.js';

const limitSchema = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (value === undefined || value.trim() === '') {
      return SEARCH_TOP_K;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > SEARCH_MAX_LIMIT) {
      ctx.addIssue({
        code: 'custom',
        message: `limit must be an integer from 1 to ${SEARCH_MAX_LIMIT}`,
      });
      return z.NEVER;
    }

    return parsed;
  });

export const searchQuerySchema = z.object({
  query: z.object({
    q: z.string().trim().min(1).max(SEARCH_QUERY_MAX_CHARS),
    limit: limitSchema,
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional(),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>['query'];
