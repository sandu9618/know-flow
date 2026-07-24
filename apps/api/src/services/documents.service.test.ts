import { beforeEach, describe, expect, it, vi } from 'vitest';

import { knowledgeSourcesRepository } from '../repositories/knowledge-sources.repository.js';
import { documentsService } from './documents.service.js';
import type { KnowledgeSource } from '../types/knowledge-source.types.js';

vi.mock('../repositories/knowledge-sources.repository.js', () => ({
  knowledgeSourcesRepository: {
    findAll: vi.fn(),
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
