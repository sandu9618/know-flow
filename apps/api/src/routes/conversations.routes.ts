import { Router } from 'express';
import { conversationsController } from '../controllers/conversations.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { getConversationBySourceSchema } from '../schemas/conversations.schema.js';

export const conversationsRouter = Router();

conversationsRouter.get(
  '/',
  validate(getConversationBySourceSchema),
  asyncHandler(conversationsController.getBySourceId),
);
