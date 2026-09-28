import { beforeEach, describe, expect, it, vi } from 'vitest';

import { embedTexts } from '../../clients/python-worker.client.js';
import { EMBED_BATCH_SIZE, EMBEDDING_DIMENSIONS } from '../../constants/ingestion.constants.js';
import type { ChunkInput } from '../../types/chunk.types.js';
import { embedChunksInBatches } from './embed-chunks.js';

vi.mock('../../clients/python-worker.client.js', () => ({
  embedTexts: vi.fn(),
}));

function chunks(count: number): ChunkInput[] {
  return Array.from({ length: count }, (_, index) => ({
    index,
    text: `chunk ${index}`,
    tokenCount: 10,
  }));
}

function vectorsFor(texts: string[]): number[][] {
  return texts.map(() => Array.from({ length: EMBEDDING_DIMENSIONS }, () => 0.2));
}

describe('embedChunksInBatches', () => {
  beforeEach(() => {
    vi.mocked(embedTexts).mockReset();
  });

  it('embeds and persists in batches of 50 before the remainder', async () => {
    const input = chunks(EMBED_BATCH_SIZE + 1);
    const events: string[] = [];

    vi.mocked(embedTexts).mockImplementation(async (texts: string[]) => {
      events.push(`embed:${texts.length}`);
      return vectorsFor(texts);
    });

    await embedChunksInBatches(input, async (updates) => {
      events.push(`persist:${updates.length}`);
    });

    expect(events).toEqual([
      `embed:${EMBED_BATCH_SIZE}`,
      `persist:${EMBED_BATCH_SIZE}`,
      'embed:1',
      'persist:1',
    ]);
    expect(embedTexts).toHaveBeenNthCalledWith(
      1,
      input.slice(0, EMBED_BATCH_SIZE).map((chunk) => chunk.text),
    );
    expect(embedTexts).toHaveBeenNthCalledWith(2, ['chunk 50']);
  });

  it('does not embed the next batch after a failure', async () => {
    const input = chunks(EMBED_BATCH_SIZE + 1);
    const persisted: number[] = [];

    vi.mocked(embedTexts)
      .mockResolvedValueOnce(vectorsFor(input.slice(0, EMBED_BATCH_SIZE).map((chunk) => chunk.text)))
      .mockRejectedValueOnce(new Error('Embedding service is unavailable'));

    await expect(
      embedChunksInBatches(input, async (updates) => {
        persisted.push(updates.length);
      }),
    ).rejects.toThrow('Embedding service is unavailable');

    expect(persisted).toEqual([EMBED_BATCH_SIZE]);
    expect(embedTexts).toHaveBeenCalledTimes(2);
  });
});
