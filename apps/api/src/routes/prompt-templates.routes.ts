import { Router } from 'express';
import { promptTemplatesController } from '../controllers/prompt-templates.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import {
  createPromptTemplateSchema,
  listPromptTemplatesSchema,
} from '../schemas/prompt-templates.schema.js';

export const promptTemplatesRouter = Router();

promptTemplatesRouter.get(
  '/',
  validate(listPromptTemplatesSchema),
  asyncHandler(promptTemplatesController.listPromptTemplates),
);

promptTemplatesRouter.post(
  '/',
  validate(createPromptTemplateSchema),
  asyncHandler(promptTemplatesController.createPromptTemplate),
);
