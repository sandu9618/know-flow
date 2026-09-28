import { beforeEach, describe, expect, it, vi } from 'vitest';

import { embedTexts } from '../../clients/python-worker.client.js';
import { EMBEDDING_DIMENSIONS } from '../../constants/ingestion.constants.js';
import { RAG_TOP_K } from '../../constants/rag.constants.js';
import { AppError } from '../../errors/AppError.js';
import { chunksRepository } from '../../repositories/chunks.repository.js';
import type { VectorSearchHit } from '../../types/chunk.types.js';
import { retrieveTopChunks } from './retrieve-chunks.service.js';

vi.mock('../../clients/python-worker.client.js', () => ({
  embedTexts: vi.fn(),
}));

vi.mock('../../repositories/chunks.repository.js', () => ({
  chunksRepository: {
    vectorSearch: vi.fn(),
  },
}));

const refundSourceId = '507f1f77bcf86cd799439011';
const securitySourceId = '507f1f77bcf86cd799439012';

function queryVector(): number[] {
  return Array.from({ length: EMBEDDING_DIMENSIONS }, () => 0.01);
}

describe('retrieveTopChunks', () => {
  beforeEach(() => {
    vi.mocked(embedTexts).mockReset();
    vi.mocked(chunksRepository.vectorSearch).mockReset();
  });

  it('embeds the question once and returns vector hits in Atlas order with source titles', async () => {
    const vector = queryVector();
    const hits: VectorSearchHit[] = [
      {
        id: 'chunk-security-1',
        sourceId: securitySourceId,
        index: 0,
        text: 'Passwords must be at least 12 characters and require MFA for admin accounts.',
        score: 0.91,
      },
      {
        id: 'chunk-refund-1',
        sourceId: refundSourceId,
        index: 2,
        text: 'EU customers may request a refund within 14 days of purchase.',
        score: 0.34,
      },
    ];

    vi.mocked(embedTexts).mockResolvedValue([vector]);
    vi.mocked(chunksRepository.vectorSearch).mockResolvedValue(hits);

    const results = await retrieveTopChunks({
      question: 'How do staff reset credentials?',
      sourceIds: [refundSourceId, securitySourceId],
      sourceTitles: {
        [securitySourceId]: 'Security Policy',
      },
    });

    expect(embedTexts).toHaveBeenCalledTimes(1);
    expect(embedTexts).toHaveBeenCalledWith(['How do staff reset credentials?']);
    expect(chunksRepository.vectorSearch).toHaveBeenCalledWith({
      vector,
      sourceIds: [refundSourceId, securitySourceId],
      limit: RAG_TOP_K,
    });
    expect(results).toEqual([
      {
        id: 'chunk-security-1',
        sourceId: securitySourceId,
        index: 0,
        text: 'Passwords must be at least 12 characters and require MFA for admin accounts.',
        score: 0.91,
        sourceTitle: 'Security Policy',
      },
      {
        id: 'chunk-refund-1',
        sourceId: refundSourceId,
        index: 2,
        text: 'EU customers may request a refund within 14 days of purchase.',
        score: 0.34,
        sourceTitle: 'Unknown source',
      },
    ]);
  });

  it('returns an empty array without embedding when no sources are selected', async () => {
    const results = await retrieveTopChunks({
      question: 'password requirements',
      sourceIds: [],
      sourceTitles: {},
    });

    expect(results).toEqual([]);
    expect(embedTexts).not.toHaveBeenCalled();
    expect(chunksRepository.vectorSearch).not.toHaveBeenCalled();
  });

  it('maps embedding worker failures to EMBEDDING_UNAVAILABLE', async () => {
    vi.mocked(embedTexts).mockRejectedValue(new Error('Embedding service is unavailable'));

    await expect(
      retrieveTopChunks({
        question: 'vacation policy',
        sourceIds: [securitySourceId],
        sourceTitles: { [securitySourceId]: 'Security Policy' },
      }),
    ).rejects.toMatchObject({
      code: 'EMBEDDING_UNAVAILABLE',
      statusCode: 503,
    });
    expect(chunksRepository.vectorSearch).not.toHaveBeenCalled();
  });

  it('maps a wrong-sized embedding to EMBEDDING_UNAVAILABLE', async () => {
    vi.mocked(embedTexts).mockResolvedValue([[0.1, 0.2]]);

    await expect(
      retrieveTopChunks({
        question: 'vacation policy',
        sourceIds: [securitySourceId],
        sourceTitles: { [securitySourceId]: 'Security Policy' },
      }),
    ).rejects.toBeInstanceOf(AppError);
    await expect(
      retrieveTopChunks({
        question: 'vacation policy',
        sourceIds: [securitySourceId],
        sourceTitles: { [securitySourceId]: 'Security Policy' },
      }),
    ).rejects.toMatchObject({
      code: 'EMBEDDING_UNAVAILABLE',
      statusCode: 503,
    });
    expect(chunksRepository.vectorSearch).not.toHaveBeenCalled();
  });

  it('maps vector index failures to VECTOR_SEARCH_UNAVAILABLE', async () => {
    vi.mocked(embedTexts).mockResolvedValue([queryVector()]);
    vi.mocked(chunksRepository.vectorSearch).mockRejectedValue(
      new Error('Unrecognized pipeline stage name: $vectorSearch'),
    );

    await expect(
      retrieveTopChunks({
        question: 'vacation policy',
        sourceIds: [securitySourceId],
        sourceTitles: { [securitySourceId]: 'Security Policy' },
      }),
    ).rejects.toMatchObject({
      code: 'VECTOR_SEARCH_UNAVAILABLE',
      statusCode: 503,
    });
  });
});
