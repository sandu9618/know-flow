import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MAX_UPLOAD_BYTES } from '@knowflow/constants';
import { bucketClient } from '../clients/bucket.client.js';
import { ingestionQueueClient } from '../clients/ingestion-queue.client.js';
import { AppError } from '../errors/AppError.js';
import { chunksRepository } from '../repositories/chunks.repository.js';
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

vi.mock('../repositories/chunks.repository.js', () => ({
  chunksRepository: {
    deleteBySourceId: vi.fn(),
  },
}));

vi.mock('../repositories/knowledge-sources.repository.js', () => ({
  knowledgeSourcesRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    insertFileUpload: vi.fn(),
    updateStatus: vi.fn(),
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

describe('documentsService.reingest', () => {
  const failedSource: KnowledgeSource = {
    ...sampleSource,
    status: 'failed',
    errorMessage: 'Could not read this file. Retry indexing, or upload a corrected PDF or TXT file.',
  };

  beforeEach(() => {
    vi.mocked(knowledgeSourcesRepository.findById).mockReset();
    vi.mocked(knowledgeSourcesRepository.updateStatus).mockReset();
    vi.mocked(ingestionQueueClient.enqueueIngestSource).mockReset();
    vi.mocked(bucketClient.uploadObject).mockReset();
  });

  it('requeues a failed source without uploading again', async () => {
    const acquiredSource: KnowledgeSource = {
      ...failedSource,
      status: 'acquired',
      errorMessage: null,
    };
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(failedSource);
    vi.mocked(knowledgeSourcesRepository.updateStatus).mockResolvedValue(acquiredSource);

    const result = await documentsService.reingest(failedSource.id);

    expect(ingestionQueueClient.enqueueIngestSource).toHaveBeenCalledWith(failedSource.id);
    expect(bucketClient.uploadObject).not.toHaveBeenCalled();
    expect(knowledgeSourcesRepository.updateStatus).toHaveBeenCalledWith(
      failedSource.id,
      'acquired',
      null,
    );
    expect(result).toMatchObject({
      id: failedSource.id,
      status: 'acquired',
      errorMessage: null,
    });
    expect('bucketKey' in result.sourceConfig).toBe(false);
  });

  it('returns 409 when the source is not failed', async () => {
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(sampleSource);

    await expect(documentsService.reingest(sampleSource.id)).rejects.toMatchObject({
      code: 'SOURCE_NOT_FAILED',
      statusCode: 409,
    });

    expect(ingestionQueueClient.enqueueIngestSource).not.toHaveBeenCalled();
    expect(knowledgeSourcesRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('returns 404 when the source does not exist', async () => {
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(null);

    await expect(documentsService.reingest(sampleSource.id)).rejects.toMatchObject({
      code: 'SOURCE_NOT_FOUND',
      statusCode: 404,
    });

    expect(ingestionQueueClient.enqueueIngestSource).not.toHaveBeenCalled();
  });
});

describe('documentsService.delete', () => {
  beforeEach(() => {
    vi.mocked(knowledgeSourcesRepository.findById).mockReset();
    vi.mocked(knowledgeSourcesRepository.deleteById).mockReset();
    vi.mocked(chunksRepository.deleteBySourceId).mockReset();
    vi.mocked(bucketClient.deleteObject).mockReset();
  });

  it('removes chunks, the source, and the bucket object', async () => {
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue({
      ...sampleSource,
      status: 'failed',
    });
    vi.mocked(knowledgeSourcesRepository.deleteById).mockResolvedValue(true);

    await documentsService.delete(sampleSource.id);

    expect(chunksRepository.deleteBySourceId).toHaveBeenCalledWith(sampleSource.id);
    expect(knowledgeSourcesRepository.deleteById).toHaveBeenCalledWith(sampleSource.id);
    expect(bucketClient.deleteObject).toHaveBeenCalledWith(sampleSource.sourceConfig.bucketKey);
  });

  it('returns 409 while the source is indexing', async () => {
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue({
      ...sampleSource,
      status: 'indexing',
    });

    await expect(documentsService.delete(sampleSource.id)).rejects.toMatchObject({
      code: 'SOURCE_INDEXING',
      statusCode: 409,
    });

    expect(chunksRepository.deleteBySourceId).not.toHaveBeenCalled();
    expect(knowledgeSourcesRepository.deleteById).not.toHaveBeenCalled();
    expect(bucketClient.deleteObject).not.toHaveBeenCalled();
  });

  it('returns 404 when the source does not exist', async () => {
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(null);

    await expect(documentsService.delete(sampleSource.id)).rejects.toMatchObject({
      code: 'SOURCE_NOT_FOUND',
      statusCode: 404,
    });

    expect(chunksRepository.deleteBySourceId).not.toHaveBeenCalled();
  });
});
