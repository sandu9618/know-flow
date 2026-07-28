import type { Request, Response } from 'express';
import { AppError } from '../errors/AppError.js';
import type { AskChatBody } from '../schemas/chat.schema.js';
import { chatService } from '../services/chat.service.js';

type AskChatRequest = Request & {
  body: AskChatBody;
};

type SseEvent =
  | { type: 'token'; text: string }
  | { type: 'done'; sourceId: string; model: string }
  | { type: 'error'; code: string; message: string };

function writeSse(res: Response, event: SseEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export const chatController = {
  async ask(req: AskChatRequest, res: Response): Promise<void> {
    const result = await chatService.askAboutSource({
      sourceId: req.body.sourceId,
      question: req.body.question,
    });

    res.status(200).json({ data: result });
  },

  async streamChat(req: AskChatRequest, res: Response): Promise<void> {
    const stream = await chatService.createAnswerStream({
      sourceId: req.body.sourceId,
      question: req.body.question,
    });

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    let clientClosed = false;
    const onClose = () => {
      clientClosed = true;
    };
    req.on('close', onClose);

    try {
      for await (const text of stream.tokens) {
        if (clientClosed) {
          break;
        }
        writeSse(res, { type: 'token', text });
      }

      if (!clientClosed) {
        writeSse(res, {
          type: 'done',
          sourceId: stream.sourceId,
          model: stream.model,
        });
      }
    } catch (error: unknown) {
      if (!clientClosed && !res.writableEnded) {
        if (error instanceof AppError) {
          writeSse(res, {
            type: 'error',
            code: error.code,
            message: error.message,
          });
        } else {
          writeSse(res, {
            type: 'error',
            code: 'LLM_PROVIDER_ERROR',
            message: 'The AI service could not answer right now. Please try again shortly.',
          });
        }
      }
    } finally {
      req.off('close', onClose);
      if (!res.writableEnded) {
        res.end();
      }
    }
  },
};
