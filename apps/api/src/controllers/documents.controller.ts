import type { Request, Response } from 'express';
import type { UploadDocumentBody } from '../schemas/documents.schema.js';
import { documentsService } from '../services/documents.service.js';

type UploadDocumentRequest = Request & {
  body: UploadDocumentBody;
};

export const documentsController = {
  async listDocuments(_req: Request, res: Response): Promise<void> {
    const sources = await documentsService.list();
    res.status(200).json({ data: sources });
  },

  async uploadDocument(req: UploadDocumentRequest, res: Response): Promise<void> {
    const source = await documentsService.acquireFileUpload({
      file: req.file,
      title: req.body?.title,
    });

    res.status(201).json({ data: source });
  },
};
