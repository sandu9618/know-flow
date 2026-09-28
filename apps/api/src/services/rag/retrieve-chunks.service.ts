import { embedTexts } from '../../clients/python-worker.client.js';
import { EMBEDDING_DIMENSIONS } from '../../constants/ingestion.constants.js';
import { RAG_TOP_K } from '../../constants/rag.constants.js';
import { AppError } from '../../errors/AppError.js';
import { chunksRepository } from '../../repositories/chunks.repository.js';

const EMBEDDING_UNAVAILABLE_MESSAGE = 'Embedding service is unavailable';
const VECTOR_SEARCH_UNAVAILABLE_MESSAGE = 'Semantic search index is not available';

export type RetrievedChunk = {
  id: string;
  sourceId: string;
  index: number;
  text: string;
  score: number;
  sourceTitle: string;
};

export async function retrieveTopChunks(input: {
  question: string;
  sourceIds: string[];
  sourceTitles: Record<string, string>;
  limit?: number;
}): Promise<RetrievedChunk[]> {
  const limit = input.limit ?? RAG_TOP_K;

  if (input.sourceIds.length === 0) {
    return [];
  }

  let queryVector: number[];
  try {
    const vectors = await embedTexts([input.question]);
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

  let hits;
  try {
    hits = await chunksRepository.vectorSearch({
      vector: queryVector,
      sourceIds: input.sourceIds,
      limit,
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('VECTOR_SEARCH_UNAVAILABLE', VECTOR_SEARCH_UNAVAILABLE_MESSAGE, 503);
  }

  const results: RetrievedChunk[] = hits.map((hit) => ({
    id: hit.id,
    sourceId: hit.sourceId,
    index: hit.index,
    text: hit.text,
    score: hit.score,
    sourceTitle: input.sourceTitles[hit.sourceId] ?? 'Unknown source',
  }));

  console.info('[rag] retrieval', {
    sourceIds: input.sourceIds,
    retrieved: results.map((chunk) => ({
      chunkId: chunk.id,
      sourceId: chunk.sourceId,
      index: chunk.index,
      score: chunk.score,
      title: chunk.sourceTitle,
    })),
  });

  return results;
}
