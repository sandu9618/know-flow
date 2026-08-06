import { MAX_UPLOAD_BYTES } from '@knowflow/constants';
import express from 'express';
import type { Server } from 'node:http';
import multer from 'multer';
import { describe, expect, it, vi } from 'vitest';

import { AppError } from '../errors/AppError.js';
import { errorHandler } from './errorHandler.js';
import { handleUploadError, uploadMiddleware } from './upload.js';

describe('upload oversized rejection (HTTP smoke)', () => {
  it('returns 413 FILE_TOO_LARGE for POST with file over 25 MB', async () => {
    const app = express();

    app.post('/', (req, res, next) => {
      uploadMiddleware.single('file')(req, res, (err) => {
        if (err) {
          handleUploadError(err, req, res, next);
          return;
        }

        res.status(201).json({ data: { ok: true } });
      });
    });
    app.use(errorHandler);

    const server = await new Promise<Server>((resolve) => {
      const listener = app.listen(0, () => resolve(listener));
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Failed to bind test server');
    }

    const form = new FormData();
    form.append(
      'file',
      new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], 'oversized.pdf', {
        type: 'application/pdf',
      }),
    );

    const response = await fetch(`http://127.0.0.1:${address.port}/`, {
      method: 'POST',
      body: form,
    });

    const body = (await response.json()) as {
      error?: { code?: string; message?: string };
    };

    expect(response.status).toBe(413);
    expect(body.error?.code).toBe('FILE_TOO_LARGE');
    expect(body.error?.message).toBe('File exceeds the 25 MB upload limit');

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  });
});

describe('handleUploadError', () => {
  it('maps LIMIT_FILE_SIZE to FILE_TOO_LARGE with status 413', () => {
    const next = vi.fn();
    const err = new multer.MulterError('LIMIT_FILE_SIZE');

    handleUploadError(err, {} as never, {} as never, next);

    expect(next).toHaveBeenCalledOnce();
    const passedError = next.mock.calls[0]?.[0];
    expect(passedError).toBeInstanceOf(AppError);
    expect(passedError).toMatchObject({
      code: 'FILE_TOO_LARGE',
      message: 'File exceeds the 25 MB upload limit',
      statusCode: 413,
    });
  });

  it('maps other multer errors to UPLOAD_ERROR with status 400', () => {
    const next = vi.fn();
    const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE');

    handleUploadError(err, {} as never, {} as never, next);

    expect(next).toHaveBeenCalledOnce();
    const passedError = next.mock.calls[0]?.[0];
    expect(passedError).toBeInstanceOf(AppError);
    expect(passedError).toMatchObject({
      code: 'UPLOAD_ERROR',
      statusCode: 400,
    });
  });

  it('passes through non-multer errors unchanged', () => {
    const next = vi.fn();
    const err = new Error('unexpected');

    handleUploadError(err, {} as never, {} as never, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});
