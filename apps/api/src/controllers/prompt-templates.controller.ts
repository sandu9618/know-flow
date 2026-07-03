import type { Request, Response } from 'express';
import type { CreatePromptTemplateBody } from '../schemas/prompt-templates.schema.js';
import { promptTemplatesService } from '../services/prompt-templates.service.js';

type CreatePromptTemplateRequest = Request & {
  body: CreatePromptTemplateBody;
};

export const promptTemplatesController = {
  async createPromptTemplate(req: CreatePromptTemplateRequest, res: Response): Promise<void> {
    const template = await promptTemplatesService.create(req.body);
    res.status(201).json({ data: template });
  },
};
