import { Router } from 'express';
import { searchController } from '../controllers/search.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { searchQuerySchema } from '../schemas/search.schema.js';

export const searchRouter = Router();

searchRouter.get(
  '/',
  validate(searchQuerySchema),
  asyncHandler(searchController.searchDocuments),
);
