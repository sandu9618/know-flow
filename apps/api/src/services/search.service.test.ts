import { beforeEach, describe, expect, it, vi } from 'vitest';

import { embedTexts } from '../clients/python-worker.client.js';
import { EMBEDDING_DIMENSIONS } from '../constants/ingestion.constants.js';
import { SEARCH_SNIPPET_CHARS, SEARCH_TOP_K } from '../constants/search.constants.js';
import { AppError } from '../errors/AppError.js';
import { chunksRepository } from '../repositories/chunks.repository.js';
import { knowledgeSourcesRepository } from '../repositories/knowledge-sources.repository.js';
import type { VectorSearchHit } from '../types/chunk.types.js';
import type { KnowledgeSource } from '../types/knowledge-source.types.js';
import { searchLibrary } from './search.service.js';

vi.mock('../clients/python-worker.client.js', () => ({
  embedTexts: vi.fn(),
}));

vi.mock('../repositories/chunks.repository.js', () => ({
  chunksRepository: {
    vectorSearch: vi.fn(),
  },
}));

vi.mock('../repositories/knowledge-sources.repository.js', () => ({
  knowledgeSourcesRepository: {
    findIdsByStatus: vi.fn(),
    findByIds: vi.fn(),
  },
}));

const handbookId = '507f1f77bcf86cd799439011';
const specId = '507f1f77bcf86cd799439012';

function source(id: string, title: string): KnowledgeSource {
  return {
    id,
    sourceType: 'file_upload',
    title,
    status: 'indexed',
    sourceConfig: {
      filename: 'doc.txt',
      bucketKey: 'uploads/doc.txt',
      mimeType: 'text/plain',
      sizeBytes: 100,
    },
    errorMessage: null,
    chunkCount: 1,
    extractedText: null,
    createdAt: new Date('2026-08-01T10:00:00.000Z'),
    acquiredAt: new Date('2026-08-01T10:00:00.000Z'),
    indexedAt: new Date('2026-08-01T10:05:00.000Z'),
  };
}

function queryVector(): number[] {
  return Array.from({ length: EMBEDDING_DIMENSIONS }, () => 0.01);
}

describe('searchLibrary', () => {
  beforeEach(() => {
    vi.mocked(embedTexts).mockReset();
    vi.mocked(chunksRepository.vectorSearch).mockReset();
    vi.mocked(knowledgeSourcesRepository.findIdsByStatus).mockReset();
    vi.mocked(knowledgeSourcesRepository.findByIds).mockReset();
  });

  it('returns ranked snippets with document titles and scores', async () => {
    const vector = queryVector();
    const hits: VectorSearchHit[] = [
      {
        id: 'chunk-leave',
        sourceId: handbookId,
        index: 2,
        text: 'Annual leave must be requested two weeks ahead.',
        score: 0.86,
      },
      {
        id: 'chunk-spec',
        sourceId: specId,
        index: 0,
        text: 'The public API uses REST.',
        score: 0.21,
      },
    ];

    vi.mocked(knowledgeSourcesRepository.findIdsByStatus).mockResolvedValue([handbookId, specId]);
    vi.mocked(embedTexts).mockResolvedValue([vector]);
    vi.mocked(chunksRepository.vectorSearch).mockResolvedValue(hits);
    vi.mocked(knowledgeSourcesRepository.findByIds).mockResolvedValue([
      source(handbookId, 'Employee Handbook'),
      source(specId, 'API Spec'),
    ]);

    const results = await searchLibrary({ query: 'employee vacation rules' });

    expect(embedTexts).toHaveBeenCalledWith(['employee vacation rules']);
    expect(chunksRepository.vectorSearch).toHaveBeenCalledWith({
      vector,
      sourceIds: [handbookId, specId],
      limit: SEARCH_TOP_K,
    });
    expect(results).toEqual([
      {
        chunkId: 'chunk-leave',
        sourceId: handbookId,
        sourceTitle: 'Employee Handbook',
        snippet: 'Annual leave must be requested two weeks ahead.',
        score: 0.86,
        index: 2,
      },
      {
        chunkId: 'chunk-spec',
        sourceId: specId,
        sourceTitle: 'API Spec',
        snippet: 'The public API uses REST.',
        score: 0.21,
        index: 0,
      },
    ]);
  });

  it('truncates long chunk text into a snippet', async () => {
    const text = `${'Annual leave policy. '.repeat(30)}end`;
    vi.mocked(knowledgeSourcesRepository.findIdsByStatus).mockResolvedValue([handbookId]);
    vi.mocked(embedTexts).mockResolvedValue([queryVector()]);
    vi.mocked(chunksRepository.vectorSearch).mockResolvedValue([
      {
        id: 'chunk-leave',
        sourceId: handbookId,
        index: 0,
        text,
        score: 0.9,
      },
    ]);
    vi.mocked(knowledgeSourcesRepository.findByIds).mockResolvedValue([
      source(handbookId, 'Employee Handbook'),
    ]);

    const results = await searchLibrary({ query: 'vacation' });

    expect(text.length).toBeGreaterThan(SEARCH_SNIPPET_CHARS);
    expect(results[0]?.snippet.endsWith('…')).toBe(true);
    expect(results[0]?.snippet.length).toBeLessThanOrEqual(SEARCH_SNIPPET_CHARS + 1);
  });

  it('returns an empty list without embedding when no sources are indexed', async () => {
    vi.mocked(knowledgeSourcesRepository.findIdsByStatus).mockResolvedValue([]);

    const results = await searchLibrary({ query: 'employee vacation rules' });

    expect(results).toEqual([]);
    expect(embedTexts).not.toHaveBeenCalled();
    expect(chunksRepository.vectorSearch).not.toHaveBeenCalled();
  });

  it('maps embedding worker failures to EMBEDDING_UNAVAILABLE', async () => {
    vi.mocked(knowledgeSourcesRepository.findIdsByStatus).mockResolvedValue([handbookId]);
    vi.mocked(embedTexts).mockRejectedValue(new Error('Embedding service is unavailable'));

    await expect(searchLibrary({ query: 'vacation' })).rejects.toEqual(
      expect.any(AppError),
    );
    await expect(searchLibrary({ query: 'vacation' })).rejects.toMatchObject({
      code: 'EMBEDDING_UNAVAILABLE',
      statusCode: 503,
    });
    expect(chunksRepository.vectorSearch).not.toHaveBeenCalled();
  });

  it('maps vector index failures to VECTOR_SEARCH_UNAVAILABLE', async () => {
    vi.mocked(knowledgeSourcesRepository.findIdsByStatus).mockResolvedValue([handbookId]);
    vi.mocked(embedTexts).mockResolvedValue([queryVector()]);
    vi.mocked(chunksRepository.vectorSearch).mockRejectedValue(
      new Error('Unrecognized pipeline stage name: $vectorSearch'),
    );

    await expect(searchLibrary({ query: 'vacation' })).rejects.toMatchObject({
      code: 'VECTOR_SEARCH_UNAVAILABLE',
      statusCode: 503,
    });
  });
});
