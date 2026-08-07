import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bucketClient } from '../../clients/bucket.client.js';
import { chunksRepository } from '../../repositories/chunks.repository.js';
import { knowledgeSourcesRepository } from '../../repositories/knowledge-sources.repository.js';
import type { KnowledgeSource } from '../../types/knowledge-source.types.js';
import { ingestSource } from './ingest-source.service.js';

vi.mock('../../clients/bucket.client.js', () => ({
  bucketClient: {
    downloadObject: vi.fn(),
  },
}));

vi.mock('../../repositories/chunks.repository.js', () => ({
  chunksRepository: {
    replaceForSource: vi.fn(),
  },
}));

vi.mock('../../repositories/knowledge-sources.repository.js', () => ({
  knowledgeSourcesRepository: {
    findById: vi.fn(),
    updateStatus: vi.fn(),
    markIndexed: vi.fn(),
  },
}));

vi.mock('./extract-text.js', () => ({
  extractTextFromBuffer: vi.fn(),
}));

import { extractTextFromBuffer } from './extract-text.js';

const sampleSource: KnowledgeSource = {
  id: '6a61e973d923b6f0e248762a',
  sourceType: 'file_upload',
  title: 'Refund Policy EU',
  status: 'acquired',
  sourceConfig: {
    filename: 'refund-policy-eu.pdf',
    bucketKey: 'uploads/6a61e973d923b6f0e248762a/refund-policy-eu.pdf',
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

describe('ingestSource', () => {
  beforeEach(() => {
    vi.mocked(knowledgeSourcesRepository.findById).mockReset();
    vi.mocked(knowledgeSourcesRepository.updateStatus).mockReset();
    vi.mocked(knowledgeSourcesRepository.markIndexed).mockReset();
    vi.mocked(chunksRepository.replaceForSource).mockReset();
    vi.mocked(bucketClient.downloadObject).mockReset();
    vi.mocked(extractTextFromBuffer).mockReset();
  });

  it('marks source indexing, stores chunks, and marks indexed with chunkCount', async () => {
    const extractedText = 'Refund policy summary for EU customers.';
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(sampleSource);
    vi.mocked(bucketClient.downloadObject).mockResolvedValue(Buffer.from(extractedText, 'utf8'));
    vi.mocked(extractTextFromBuffer).mockResolvedValue(extractedText);
    vi.mocked(chunksRepository.replaceForSource).mockResolvedValue(1);

    await ingestSource(sampleSource.id);

    expect(knowledgeSourcesRepository.updateStatus).toHaveBeenCalledWith(
      sampleSource.id,
      'indexing',
    );
    expect(chunksRepository.replaceForSource).toHaveBeenCalledWith(
      sampleSource.id,
      expect.arrayContaining([
        expect.objectContaining({
          index: 0,
          text: extractedText,
        }),
      ]),
    );
    expect(knowledgeSourcesRepository.markIndexed).toHaveBeenCalledWith(sampleSource.id, {
      extractedText,
      chunkCount: 1,
    });
  });

  it('marks source failed when extracted text cannot be chunked', async () => {
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(sampleSource);
    vi.mocked(bucketClient.downloadObject).mockResolvedValue(Buffer.from(' ', 'utf8'));
    vi.mocked(extractTextFromBuffer).mockResolvedValue('   ');

    await expect(ingestSource(sampleSource.id)).rejects.toThrow(
      'No text content available to index',
    );

    expect(knowledgeSourcesRepository.updateStatus).toHaveBeenCalledWith(
      sampleSource.id,
      'failed',
      'No text content available to index',
    );
    expect(chunksRepository.replaceForSource).not.toHaveBeenCalled();
    expect(knowledgeSourcesRepository.markIndexed).not.toHaveBeenCalled();
  });
});
