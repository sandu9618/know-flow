import { access } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bucketClient } from '../../clients/bucket.client.js';
import { extractTextFromPath } from '../ingestion/extract-text.js';
import { resolveFileUploadText } from './file-upload.adapter.js';
import type { KnowledgeSource } from '../../types/knowledge-source.types.js';

vi.mock('../../clients/bucket.client.js', () => ({
  bucketClient: {
    createReadStream: vi.fn(),
  },
}));

vi.mock('../ingestion/extract-text.js', () => ({
  extractTextFromPath: vi.fn(),
}));

const sampleSource: KnowledgeSource = {
  id: '6a61e973d923b6f0e248762a',
  sourceType: 'file_upload',
  title: 'Refund Policy EU',
  status: 'acquired',
  sourceConfig: {
    filename: 'refund-policy-eu.txt',
    bucketKey: 'uploads/6a61e973d923b6f0e248762a/refund-policy-eu.txt',
    mimeType: 'text/plain',
    sizeBytes: 128,
  },
  errorMessage: null,
  chunkCount: null,
  extractedText: null,
  createdAt: new Date('2026-07-23T10:14:12.001Z'),
  acquiredAt: new Date('2026-07-23T10:14:12.001Z'),
  indexedAt: null,
};

describe('resolveFileUploadText', () => {
  beforeEach(() => {
    vi.mocked(bucketClient.createReadStream).mockReset();
    vi.mocked(extractTextFromPath).mockReset();
  });

  it('streams the object to a temp file, extracts text, and unlinks the file', async () => {
    let capturedPath = '';
    vi.mocked(bucketClient.createReadStream).mockResolvedValue(
      Readable.from(Buffer.from('EU refunds within 14 days.', 'utf8')),
    );
    vi.mocked(extractTextFromPath).mockImplementation(async (filePath, mimeType) => {
      capturedPath = filePath;
      await access(filePath);
      expect(mimeType).toBe('text/plain');
      return 'EU refunds within 14 days.';
    });

    const text = await resolveFileUploadText(sampleSource);

    expect(text).toBe('EU refunds within 14 days.');
    expect(bucketClient.createReadStream).toHaveBeenCalledWith(
      sampleSource.sourceConfig.bucketKey,
    );
    expect(capturedPath).toContain('knowflow-ingest-');
    await expect(access(capturedPath)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('unlinks the temp file when extraction fails', async () => {
    let capturedPath = '';
    vi.mocked(bucketClient.createReadStream).mockResolvedValue(
      Readable.from(Buffer.from('not a pdf', 'utf8')),
    );
    vi.mocked(extractTextFromPath).mockImplementation(async (filePath) => {
      capturedPath = filePath;
      throw new Error('PDF contained no extractable text');
    });

    await expect(resolveFileUploadText(sampleSource)).rejects.toThrow(
      'PDF contained no extractable text',
    );

    expect(capturedPath).not.toBe('');
    await expect(access(capturedPath)).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
