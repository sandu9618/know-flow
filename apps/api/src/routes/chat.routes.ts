import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { askChatSchema } from '../schemas/chat.schema.js';

export const chatRouter = Router();

chatRouter.post('/', validate(askChatSchema), asyncHandler(chatController.ask));
