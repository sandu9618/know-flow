import { afterEach, describe, expect, it, vi } from 'vitest';

import { config } from '../config.js';
import { EMBEDDING_DIMENSIONS } from '../constants/ingestion.constants.js';
import { embedTexts } from './python-worker.client.js';

function vector(value = 0.2): number[] {
  return Array.from({ length: EMBEDDING_DIMENSIONS }, () => value);
}

describe('embedTexts', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts texts to the python worker and returns vectors', async () => {
    const embedding = vector();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [embedding],
        meta: { count: 1, dimensions: EMBEDDING_DIMENSIONS, model: 'gemini-embedding-2' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(embedTexts(['refund policy'])).resolves.toEqual([embedding]);

    expect(fetchMock).toHaveBeenCalledWith(
      `${config.pythonWorkerUrl.replace(/\/$/, '')}/embed`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ texts: ['refund policy'] }),
      }),
    );
  });

  it('rejects a vector count that does not match the input', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [vector(), vector()] }),
      }),
    );

    await expect(embedTexts(['only one'])).rejects.toThrow('Embedding service is unavailable');
  });

  it('rejects a vector with the wrong dimension', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [[0.1, 0.2]] }),
      }),
    );

    await expect(embedTexts(['refund policy'])).rejects.toThrow('Embedding service is unavailable');
  });

  it('rejects a non-ok response without reading provider details', async () => {
    const json = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json,
      }),
    );

    await expect(embedTexts(['refund policy'])).rejects.toThrow('Embedding service is unavailable');
    expect(json).not.toHaveBeenCalled();
  });

  it('rejects when the worker cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED')));

    await expect(embedTexts(['refund policy'])).rejects.toThrow('Embedding service is unavailable');
  });
});
