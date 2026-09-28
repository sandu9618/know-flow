import type { Request, Response } from 'express';
import type { SearchQuery } from '../schemas/search.schema.js';
import { searchLibrary } from '../services/search.service.js';

export const searchController = {
  async searchDocuments(req: Request, res: Response): Promise<void> {
    const { q, limit } = req.query as unknown as SearchQuery;
    const results = await searchLibrary({ query: q, limit });
    res.status(200).json({ data: results });
  },
};
