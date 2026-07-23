import { Router } from 'express';
import { documentsController } from '../controllers/documents.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { handleUploadError, uploadMiddleware } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  listDocumentsSchema,
  uploadDocumentSchema,
} from '../schemas/documents.schema.js';

export const documentsRouter = Router();

documentsRouter.get(
  '/',
  validate(listDocumentsSchema),
  asyncHandler(documentsController.listDocuments),
);

documentsRouter.post(
  '/',
  (req, res, next) => {
    uploadMiddleware.single('file')(req, res, (err) => {
      if (err) {
        handleUploadError(err, req, res, next);
        return;
      }
      next();
    });
  },
  validate(uploadDocumentSchema),
  asyncHandler(documentsController.uploadDocument),
);
