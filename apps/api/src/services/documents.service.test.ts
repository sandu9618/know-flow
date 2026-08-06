import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MAX_UPLOAD_BYTES } from '@knowflow/constants';
import { bucketClient } from '../clients/bucket.client.js';
import { ingestionQueueClient } from '../clients/ingestion-queue.client.js';
import { AppError } from '../errors/AppError.js';
import { knowledgeSourcesRepository } from '../repositories/knowledge-sources.repository.js';
import { documentsService } from './documents.service.js';
import type { KnowledgeSource } from '../types/knowledge-source.types.js';

vi.mock('../clients/bucket.client.js', () => ({
  bucketClient: {
    uploadObject: vi.fn(),
    deleteObject: vi.fn(),
  },
}));

vi.mock('../clients/ingestion-queue.client.js', () => ({
  ingestionQueueClient: {
    enqueueIngestSource: vi.fn(),
  },
}));

vi.mock('../repositories/knowledge-sources.repository.js', () => ({
  knowledgeSourcesRepository: {
    findAll: vi.fn(),
    insertFileUpload: vi.fn(),
    deleteById: vi.fn(),
  },
}));

const sampleSource: KnowledgeSource = {
  id: '6a61e973d923b6f0e248762a',
  sourceType: 'file_upload',
  title: 'Refund Policy EU',
  status: 'acquired',
  sourceConfig: {
    filename: 'refund-policy-eu.pdf',
    bucketKey: 'uploads/6a61e973d923b6f0e248762a/refund-policy-eu.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1048576,
  },
  errorMessage: null,
  chunkCount: null,
  extractedText: null,
  createdAt: new Date('2026-07-23T10:14:12.001Z'),
  acquiredAt: new Date('2026-07-23T10:14:12.001Z'),
  indexedAt: null,
};

function oversizedFile() {
  return {
    buffer: Buffer.alloc(1),
    originalname: 'oversized.pdf',
    mimetype: 'application/pdf',
    size: MAX_UPLOAD_BYTES + 1,
  };
}

describe('documentsService.list', () => {
  beforeEach(() => {
    vi.mocked(knowledgeSourcesRepository.findAll).mockReset();
  });

  it('returns projected list metadata without bucket keys', async () => {
    vi.mocked(knowledgeSourcesRepository.findAll).mockResolvedValue([sampleSource]);

    const sources = await documentsService.list();

    const [firstSource] = sources;

    expect(firstSource).toBeDefined();
    expect(sources).toHaveLength(1);
    expect(firstSource).toMatchObject({
      id: sampleSource.id,
      title: sampleSource.title,
      sourceType: 'file_upload',
      status: 'acquired',
      sourceConfig: {
        filename: 'refund-policy-eu.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1048576,
      },
    });
    expect('bucketKey' in firstSource!.sourceConfig).toBe(false);
  });
});

describe('documentsService.acquireFileUpload', () => {
  beforeEach(() => {
    vi.mocked(bucketClient.uploadObject).mockReset();
    vi.mocked(knowledgeSourcesRepository.insertFileUpload).mockReset();
  });

  it('rejects oversized files with 413 and does not write to bucket or Mongo', async () => {
    await expect(
      documentsService.acquireFileUpload({ file: oversizedFile() as never }),
    ).rejects.toMatchObject({
      code: 'FILE_TOO_LARGE',
      message: 'File exceeds the 25 MB upload limit',
      statusCode: 413,
    });

    expect(bucketClient.uploadObject).not.toHaveBeenCalled();
    expect(knowledgeSourcesRepository.insertFileUpload).not.toHaveBeenCalled();
    expect(ingestionQueueClient.enqueueIngestSource).not.toHaveBeenCalled();
  });

  it('rejects oversized files as AppError instances', async () => {
    await expect(
      documentsService.acquireFileUpload({ file: oversizedFile() as never }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
