import type { Request, Response } from 'express';
import type { GetConversationBySourceQuery } from '../schemas/conversations.schema.js';
import { conversationsService } from '../services/conversations.service.js';

export const conversationsController = {
  async getBySourceId(req: Request, res: Response): Promise<void> {
    const { sourceId } = req.query as GetConversationBySourceQuery;
    const conversation = await conversationsService.getBySourceId(sourceId);
    res.status(200).json({ data: conversation });
  },
};
