import { beforeEach, describe, expect, it, vi } from 'vitest';

import { chunksRepository } from '../../repositories/chunks.repository.js';
import { knowledgeSourcesRepository } from '../../repositories/knowledge-sources.repository.js';
import type { KnowledgeSource } from '../../types/knowledge-source.types.js';
import { getContentAdapter } from '../acquisition/adapters.js';
import { ingestSource } from './ingest-source.service.js';

vi.mock('../acquisition/adapters.js', () => ({
  getContentAdapter: vi.fn(),
}));

vi.mock('../../repositories/chunks.repository.js', () => ({
  chunksRepository: {
    replaceForSource: vi.fn(),
    deleteBySourceId: vi.fn(),
  },
}));

vi.mock('../../repositories/knowledge-sources.repository.js', () => ({
  knowledgeSourcesRepository: {
    findById: vi.fn(),
    updateStatus: vi.fn(),
    markIndexed: vi.fn(),
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
  const resolveText = vi.fn();

  beforeEach(() => {
    vi.mocked(knowledgeSourcesRepository.findById).mockReset();
    vi.mocked(knowledgeSourcesRepository.updateStatus).mockReset();
    vi.mocked(knowledgeSourcesRepository.markIndexed).mockReset();
    vi.mocked(chunksRepository.replaceForSource).mockReset();
    vi.mocked(chunksRepository.deleteBySourceId).mockReset();
    vi.mocked(getContentAdapter).mockReset();
    resolveText.mockReset();
    vi.mocked(getContentAdapter).mockReturnValue({
      sourceType: 'file_upload',
      displayName: 'File Upload',
      implemented: true,
      resolveText,
    });
  });

  it('marks source indexing, stores chunks, and marks indexed with chunkCount only', async () => {
    const extractedText = 'Refund policy summary for EU customers.';
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(sampleSource);
    resolveText.mockResolvedValue(extractedText);
    vi.mocked(chunksRepository.replaceForSource).mockResolvedValue(1);

    await ingestSource(sampleSource.id);

    expect(getContentAdapter).toHaveBeenCalledWith('file_upload');
    expect(resolveText).toHaveBeenCalledWith(sampleSource);
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
      chunkCount: 1,
    });
    expect(knowledgeSourcesRepository.markIndexed).toHaveBeenCalledWith(
      sampleSource.id,
      expect.not.objectContaining({ extractedText }),
    );
    expect(chunksRepository.deleteBySourceId).not.toHaveBeenCalled();
  });

  it('marks source failed when extracted text cannot be chunked', async () => {
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(sampleSource);
    resolveText.mockResolvedValue('   ');

    await expect(ingestSource(sampleSource.id)).rejects.toThrow(
      'No text content available to index',
    );

    expect(knowledgeSourcesRepository.updateStatus).toHaveBeenCalledWith(
      sampleSource.id,
      'failed',
      'No text content available to index',
    );
    expect(chunksRepository.deleteBySourceId).toHaveBeenCalledWith(sampleSource.id);
    expect(chunksRepository.replaceForSource).not.toHaveBeenCalled();
    expect(knowledgeSourcesRepository.markIndexed).not.toHaveBeenCalled();
  });

  it('does not mark failed or delete chunks before the final attempt', async () => {
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(sampleSource);
    resolveText.mockRejectedValue(new Error('Invalid PDF structure'));

    await expect(
      ingestSource(sampleSource.id, { isFinalAttempt: false }),
    ).rejects.toThrow('Invalid PDF structure');

    expect(knowledgeSourcesRepository.updateStatus).toHaveBeenCalledTimes(1);
    expect(knowledgeSourcesRepository.updateStatus).toHaveBeenCalledWith(
      sampleSource.id,
      'indexing',
    );
    expect(chunksRepository.deleteBySourceId).not.toHaveBeenCalled();
    expect(chunksRepository.replaceForSource).not.toHaveBeenCalled();
  });

  it('stores a short message and deletes chunks on the final attempt', async () => {
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(sampleSource);
    resolveText.mockRejectedValue(new Error('Invalid PDF structure\n    at PDFParse.parse'));

    await expect(
      ingestSource(sampleSource.id, { isFinalAttempt: true }),
    ).rejects.toThrow('Invalid PDF structure');

    expect(knowledgeSourcesRepository.updateStatus).toHaveBeenCalledWith(
      sampleSource.id,
      'failed',
      'Could not read this file. Retry indexing, or upload a corrected PDF or TXT file.',
    );
    expect(chunksRepository.deleteBySourceId).toHaveBeenCalledWith(sampleSource.id);
    expect(chunksRepository.replaceForSource).not.toHaveBeenCalled();
  });

  it('marks source failed when no ingest adapter exists and does not persist chunks', async () => {
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue({
      ...sampleSource,
      sourceType: 'jira',
    });
    vi.mocked(getContentAdapter).mockImplementation((sourceType) => {
      throw new Error(`No ingest adapter for source type: ${sourceType}`);
    });

    await expect(ingestSource(sampleSource.id)).rejects.toThrow(
      'No ingest adapter for source type: jira',
    );

    expect(chunksRepository.replaceForSource).not.toHaveBeenCalled();
    expect(knowledgeSourcesRepository.markIndexed).not.toHaveBeenCalled();
    expect(knowledgeSourcesRepository.updateStatus).toHaveBeenCalledWith(
      sampleSource.id,
      'failed',
      'Could not read this file. Retry indexing, or upload a corrected PDF or TXT file.',
    );
    expect(chunksRepository.deleteBySourceId).toHaveBeenCalledWith(sampleSource.id);
  });

  it('persists chunks for one source before processing the next', async () => {
    const sourceA = { ...sampleSource, id: 'aaaaaaaaaaaaaaaaaaaaaaaa' };
    const sourceB = { ...sampleSource, id: 'bbbbbbbbbbbbbbbbbbbbbbbb' };
    const sourceC = { ...sampleSource, id: 'cccccccccccccccccccccccc' };
    const order: string[] = [];

    vi.mocked(knowledgeSourcesRepository.findById).mockImplementation(async (id) => {
      if (id === sourceA.id) return sourceA;
      if (id === sourceB.id) return sourceB;
      if (id === sourceC.id) return sourceC;
      return null;
    });

    resolveText.mockImplementation(async (source) => {
      order.push(`resolve:${source.id}`);
      return 'Refund policy summary for EU customers.';
    });

    vi.mocked(chunksRepository.replaceForSource).mockImplementation(async (sourceId) => {
      order.push(`persist:${sourceId}`);
      return 1;
    });

    await ingestSource(sourceA.id);
    await ingestSource(sourceB.id);
    await ingestSource(sourceC.id);

    expect(order).toEqual([
      `resolve:${sourceA.id}`,
      `persist:${sourceA.id}`,
      `resolve:${sourceB.id}`,
      `persist:${sourceB.id}`,
      `resolve:${sourceC.id}`,
      `persist:${sourceC.id}`,
    ]);
    expect(knowledgeSourcesRepository.markIndexed).toHaveBeenNthCalledWith(1, sourceA.id, {
      chunkCount: 1,
    });
    expect(knowledgeSourcesRepository.markIndexed).toHaveBeenNthCalledWith(3, sourceC.id, {
      chunkCount: 1,
    });
  });
});
