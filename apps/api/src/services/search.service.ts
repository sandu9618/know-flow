import { embedTexts } from '../clients/python-worker.client.js';
import { EMBEDDING_DIMENSIONS } from '../constants/ingestion.constants.js';
import { SEARCH_SNIPPET_CHARS, SEARCH_TOP_K } from '../constants/search.constants.js';
import { AppError } from '../errors/AppError.js';
import { chunksRepository } from '../repositories/chunks.repository.js';
import { knowledgeSourcesRepository } from '../repositories/knowledge-sources.repository.js';
import type { SearchResult } from '../types/search.types.js';

const EMBEDDING_UNAVAILABLE_MESSAGE = 'Embedding service is unavailable';
const VECTOR_SEARCH_UNAVAILABLE_MESSAGE = 'Semantic search index is not available';

export async function searchLibrary(input: {
  query: string;
  limit?: number;
}): Promise<SearchResult[]> {
  const limit = input.limit ?? SEARCH_TOP_K;
  const sourceIds = await knowledgeSourcesRepository.findIdsByStatus('indexed');

  if (sourceIds.length === 0) {
    return [];
  }

  const startedAt = Date.now();
  let queryVector: number[];
  const embedStartedAt = Date.now();
  try {
    const vectors = await embedTexts([input.query]);
    const vector = vectors[0];
    if (!vector || vector.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(EMBEDDING_UNAVAILABLE_MESSAGE);
    }
    queryVector = vector;
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('EMBEDDING_UNAVAILABLE', EMBEDDING_UNAVAILABLE_MESSAGE, 503);
  }
  const embedMs = Date.now() - embedStartedAt;

  let hits;
  const vectorStartedAt = Date.now();
  try {
    hits = await chunksRepository.vectorSearch({
      vector: queryVector,
      sourceIds,
      limit,
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('VECTOR_SEARCH_UNAVAILABLE', VECTOR_SEARCH_UNAVAILABLE_MESSAGE, 503);
  }
  const vectorMs = Date.now() - vectorStartedAt;

  const sources = await knowledgeSourcesRepository.findByIds(hits.map((hit) => hit.sourceId));
  const titleBySourceId = new Map(sources.map((source) => [source.id, source.title]));

  const results = hits.map((hit) => ({
    chunkId: hit.id,
    sourceId: hit.sourceId,
    sourceTitle: titleBySourceId.get(hit.sourceId) ?? 'Unknown source',
    snippet: toSnippet(hit.text),
    score: hit.score,
    index: hit.index,
  }));

  console.info('[search] query', {
    totalMs: Date.now() - startedAt,
    embedMs,
    vectorMs,
    hits: hits.length,
  });

  return results;
}

function toSnippet(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= SEARCH_SNIPPET_CHARS) {
    return normalized;
  }

  return `${normalized.slice(0, SEARCH_SNIPPET_CHARS).trimEnd()}…`;
}
