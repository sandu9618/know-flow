import type { Request, Response } from 'express';
import type {
  CreatePromptTemplateBody,
  ListPromptTemplatesQuery,
} from '../schemas/prompt-templates.schema.js';
import { promptTemplatesService } from '../services/prompt-templates.service.js';

type CreatePromptTemplateRequest = Request & {
  body: CreatePromptTemplateBody;
};

type ListPromptTemplatesRequest = Request & {
  query: ListPromptTemplatesQuery;
};

export const promptTemplatesController = {
  async listPromptTemplates(req: ListPromptTemplatesRequest, res: Response): Promise<void> {
    const templates = await promptTemplatesService.list(req.query);
    res.status(200).json({ data: templates });
  },

  async createPromptTemplate(req: CreatePromptTemplateRequest, res: Response): Promise<void> {
    const template = await promptTemplatesService.create(req.body);
    res.status(201).json({ data: template });
  },
};
