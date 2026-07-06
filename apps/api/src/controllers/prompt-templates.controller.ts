import type { Request, Response } from 'express';
import type {
  CreatePromptTemplateBody,
  ListPromptTemplatesQuery,
  UpdatePromptTemplateBody,
  UpdatePromptTemplateParams,
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

  async updatePromptTemplate(req: Request, res: Response): Promise<void> {
    const { id } = req.params as UpdatePromptTemplateParams;
    const body = req.body as UpdatePromptTemplateBody;
    const template = await promptTemplatesService.update(id, body);
    res.status(200).json({ data: template });
  },
};
