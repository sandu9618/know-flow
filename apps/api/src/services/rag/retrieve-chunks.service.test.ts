import { beforeEach, describe, expect, it, vi } from 'vitest';

import { chunksRepository } from '../../repositories/chunks.repository.js';
import type { Chunk } from '../../types/chunk.types.js';
import {
  retrieveTopChunks,
  tokenizeQuestion,
} from './retrieve-chunks.service.js';

vi.mock('../../repositories/chunks.repository.js', () => ({
  chunksRepository: {
    findBySourceIds: vi.fn(),
  },
}));

const refundChunk: Chunk = {
  id: 'chunk-refund-1',
  sourceId: 'source-refund',
  index: 0,
  text: 'EU customers may request a refund within 14 days of purchase.',
  tokenCount: 12,
  createdAt: new Date('2026-08-01T10:00:00.000Z'),
};

const securityChunk: Chunk = {
  id: 'chunk-security-1',
  sourceId: 'source-security',
  index: 0,
  text: 'Passwords must be at least 12 characters and require MFA for admin accounts.',
  tokenCount: 14,
  createdAt: new Date('2026-08-01T10:00:00.000Z'),
};

describe('tokenizeQuestion', () => {
  it('removes stop words and short tokens', () => {
    expect(tokenizeQuestion('What are the password requirements?')).toEqual([
      'password',
      'requirements',
    ]);
  });
});

describe('retrieveTopChunks', () => {
  beforeEach(() => {
    vi.mocked(chunksRepository.findBySourceIds).mockReset();
  });

  it('ranks chunks by keyword overlap across multiple sources', async () => {
    vi.mocked(chunksRepository.findBySourceIds).mockResolvedValue([
      refundChunk,
      securityChunk,
    ]);

    const results = await retrieveTopChunks({
      question: 'What are the password requirements?',
      sourceIds: ['source-refund', 'source-security'],
      sourceTitles: {
        'source-refund': 'Refund Policy',
        'source-security': 'Security Policy',
      },
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('chunk-security-1');
    expect(results[0]?.sourceTitle).toBe('Security Policy');
    expect(results[0]?.score).toBeGreaterThan(0);
  });

  it('falls back to the first chunks when no terms match', async () => {
    vi.mocked(chunksRepository.findBySourceIds).mockResolvedValue([
      refundChunk,
      securityChunk,
    ]);

    const results = await retrieveTopChunks({
      question: '???',
      sourceIds: ['source-refund', 'source-security'],
      sourceTitles: {
        'source-refund': 'Refund Policy',
        'source-security': 'Security Policy',
      },
      limit: 1,
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.score).toBe(0);
  });

  it('returns an empty array when no chunks exist', async () => {
    vi.mocked(chunksRepository.findBySourceIds).mockResolvedValue([]);

    const results = await retrieveTopChunks({
      question: 'password requirements',
      sourceIds: ['source-security'],
      sourceTitles: {
        'source-security': 'Security Policy',
      },
    });

    expect(results).toEqual([]);
  });
});
