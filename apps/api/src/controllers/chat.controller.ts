import type { Request, Response } from 'express';
import type { AskChatBody } from '../schemas/chat.schema.js';
import { chatService } from '../services/chat.service.js';

type AskChatRequest = Request & {
  body: AskChatBody;
};

export const chatController = {
  async ask(req: AskChatRequest, res: Response): Promise<void> {
    const result = await chatService.askAboutSource({
      sourceId: req.body.sourceId,
      question: req.body.question,
    });

    res.status(200).json({ data: result });
  },
};
