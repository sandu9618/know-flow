import { EMBED_BATCH_SIZE, EMBEDDING_DIMENSIONS } from '../../constants/ingestion.constants.js';
import { embedTexts } from '../../clients/python-worker.client.js';
import type { ChunkEmbeddingUpdate, ChunkInput } from '../../types/chunk.types.js';

export async function embedChunksInBatches(
  chunks: ChunkInput[],
  onBatch: (updates: ChunkEmbeddingUpdate[]) => Promise<void>,
): Promise<void> {
  for (let offset = 0; offset < chunks.length; offset += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(offset, offset + EMBED_BATCH_SIZE);
    const vectors = await embedTexts(batch.map((chunk) => chunk.text));

    if (vectors.length !== batch.length) {
      throw new Error('Embedding service is unavailable');
    }

    const updates: ChunkEmbeddingUpdate[] = batch.map((chunk, index) => {
      const embedding = vectors[index];
      if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
        throw new Error('Embedding service is unavailable');
      }

      return { index: chunk.index, embedding };
    });

    await onBatch(updates);
  }
}
