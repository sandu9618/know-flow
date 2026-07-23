import multer from 'multer';
import type { NextFunction, Request, Response } from 'express';
import { MAX_UPLOAD_BYTES } from '../constants/documents.constants.js';
import { AppError } from '../errors/AppError.js';

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

export function handleUploadError(
  err: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(
        new AppError(
          'FILE_TOO_LARGE',
          'File exceeds the 25 MB upload limit',
          413,
        ),
      );
      return;
    }

    next(new AppError('UPLOAD_ERROR', err.message, 400));
    return;
  }

  next(err);
}
