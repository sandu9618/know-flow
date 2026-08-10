import { RAG_STOP_WORDS, RAG_TOP_K } from '../../constants/rag.constants.js';
import { chunksRepository } from '../../repositories/chunks.repository.js';
import type { Chunk } from '../../types/chunk.types.js';

export type RetrievedChunk = Chunk & {
  score: number;
  sourceTitle: string;
};

export function tokenizeQuestion(question: string): string[] {
  const terms = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length >= 3 && !RAG_STOP_WORDS.has(term));

  return [...new Set(terms)];
}

function scoreChunkText(text: string, terms: string[]): number {
  if (terms.length === 0) {
    return 0;
  }

  const lowerText = text.toLowerCase();
  return terms.filter((term) => lowerText.includes(term)).length;
}

function sortChunks(chunks: RetrievedChunk[]): RetrievedChunk[] {
  return [...chunks].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (left.sourceId !== right.sourceId) {
      return left.sourceId.localeCompare(right.sourceId);
    }

    return left.index - right.index;
  });
}

function buildRetrievedChunks(
  chunks: Chunk[],
  sourceTitles: Record<string, string>,
  terms: string[],
): RetrievedChunk[] {
  return chunks.map((chunk) => ({
    ...chunk,
    score: scoreChunkText(chunk.text, terms),
    sourceTitle: sourceTitles[chunk.sourceId] ?? 'Unknown source',
  }));
}

export async function retrieveTopChunks(input: {
  question: string;
  sourceIds: string[];
  sourceTitles: Record<string, string>;
  limit?: number;
}): Promise<RetrievedChunk[]> {
  const limit = input.limit ?? RAG_TOP_K;
  const questionTerms = tokenizeQuestion(input.question);
  const chunks = await chunksRepository.findBySourceIds(input.sourceIds);

  if (chunks.length === 0) {
    return [];
  }

  const scored = sortChunks(buildRetrievedChunks(chunks, input.sourceTitles, questionTerms));
  const matched = scored.filter((chunk) => chunk.score > 0).slice(0, limit);

  let results: RetrievedChunk[];
  let retrievalFallback = false;

  if (matched.length > 0) {
    results = matched;
  } else {
    retrievalFallback = true;
    results = scored.slice(0, limit);
  }

  console.info('[rag] retrieval', {
    sourceIds: input.sourceIds,
    questionTerms,
    retrievalFallback,
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
