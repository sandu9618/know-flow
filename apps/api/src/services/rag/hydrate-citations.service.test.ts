import { beforeEach, describe, expect, it, vi } from 'vitest';

import { chunksRepository } from '../../repositories/chunks.repository.js';
import { knowledgeSourcesRepository } from '../../repositories/knowledge-sources.repository.js';
import type { Chunk } from '../../types/chunk.types.js';
import type { KnowledgeSource } from '../../types/knowledge-source.types.js';
import { hydrateCitations, loadCitationMap } from './hydrate-citations.service.js';

vi.mock('../../repositories/chunks.repository.js', () => ({
  chunksRepository: {
    findByIds: vi.fn(),
  },
}));

vi.mock('../../repositories/knowledge-sources.repository.js', () => ({
  knowledgeSourcesRepository: {
    findByIds: vi.fn(),
  },
}));

const chunkA: Chunk = {
  id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
  sourceId: '6a61e973d923b6f0e248762a',
  index: 0,
  text: 'Refund within 14 days.',
  tokenCount: 5,
  createdAt: new Date('2026-07-23T10:14:20.001Z'),
};

const chunkB: Chunk = {
  id: 'bbbbbbbbbbbbbbbbbbbbbbbb',
  sourceId: '7b72f084e034c7f1f359873b',
  index: 2,
  text: 'Passwords must be 12 characters.',
  tokenCount: 6,
  createdAt: new Date('2026-07-23T10:14:21.001Z'),
};

const sources: KnowledgeSource[] = [
  {
    id: chunkA.sourceId,
    sourceType: 'file_upload',
    title: 'Refund Policy',
    status: 'indexed',
    sourceConfig: {
      filename: 'refund.txt',
      bucketKey: 'uploads/refund.txt',
      mimeType: 'text/plain',
      sizeBytes: 10,
    },
    errorMessage: null,
    chunkCount: 1,
    extractedText: null,
    createdAt: new Date(),
    acquiredAt: new Date(),
    indexedAt: new Date(),
  },
  {
    id: chunkB.sourceId,
    sourceType: 'file_upload',
    title: 'Security Policy',
    status: 'indexed',
    sourceConfig: {
      filename: 'security.txt',
      bucketKey: 'uploads/security.txt',
      mimeType: 'text/plain',
      sizeBytes: 10,
    },
    errorMessage: null,
    chunkCount: 1,
    extractedText: null,
    createdAt: new Date(),
    acquiredAt: new Date(),
    indexedAt: new Date(),
  },
];

describe('hydrateCitations', () => {
  beforeEach(() => {
    vi.mocked(chunksRepository.findByIds).mockReset();
    vi.mocked(knowledgeSourcesRepository.findByIds).mockReset();
  });

  it('returns enriched citations in request order and omits missing chunk IDs', async () => {
    vi.mocked(chunksRepository.findByIds).mockResolvedValue([chunkA, chunkB]);
    vi.mocked(knowledgeSourcesRepository.findByIds).mockResolvedValue(sources);

    const citations = await hydrateCitations([
      chunkB.id,
      'cccccccccccccccccccccccc',
      chunkA.id,
      chunkB.id,
    ]);

    expect(citations).toEqual([
      {
        chunkId: chunkB.id,
        sourceId: chunkB.sourceId,
        sourceTitle: 'Security Policy',
        chunkIndex: 2,
        text: chunkB.text,
      },
      {
        chunkId: chunkA.id,
        sourceId: chunkA.sourceId,
        sourceTitle: 'Refund Policy',
        chunkIndex: 0,
        text: chunkA.text,
      },
      {
        chunkId: chunkB.id,
        sourceId: chunkB.sourceId,
        sourceTitle: 'Security Policy',
        chunkIndex: 2,
        text: chunkB.text,
      },
    ]);
  });

  it('returns an empty list when no IDs are provided', async () => {
    await expect(hydrateCitations([])).resolves.toEqual([]);
    expect(chunksRepository.findByIds).not.toHaveBeenCalled();
  });
});

describe('loadCitationMap', () => {
  beforeEach(() => {
    vi.mocked(chunksRepository.findByIds).mockReset();
    vi.mocked(knowledgeSourcesRepository.findByIds).mockReset();
  });

  it('maps chunk IDs to citation DTOs', async () => {
    vi.mocked(chunksRepository.findByIds).mockResolvedValue([chunkA]);
    vi.mocked(knowledgeSourcesRepository.findByIds).mockResolvedValue([sources[0]!]);

    const map = await loadCitationMap([chunkA.id]);

    expect(map.get(chunkA.id)).toEqual({
      chunkId: chunkA.id,
      sourceId: chunkA.sourceId,
      sourceTitle: 'Refund Policy',
      chunkIndex: 0,
      text: chunkA.text,
    });
    expect(map.has('missing')).toBe(false);
  });
});
