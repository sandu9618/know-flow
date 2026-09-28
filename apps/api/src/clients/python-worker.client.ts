import { EMBED_BATCH_SIZE, EMBEDDING_DIMENSIONS } from '../constants/ingestion.constants.js';
import { config } from '../config.js';

const EMBED_TIMEOUT_MS = 30_000;
const UNAVAILABLE_MESSAGE = 'Embedding service is unavailable';

function embedUrl(): string {
  return `${config.pythonWorkerUrl.replace(/\/$/, '')}/embed`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseVectors(body: unknown, expectedCount: number): number[][] {
  if (typeof body !== 'object' || body === null || !('data' in body)) {
    throw new Error(UNAVAILABLE_MESSAGE);
  }

  const data = body.data;
  if (!Array.isArray(data) || data.length !== expectedCount) {
    throw new Error(UNAVAILABLE_MESSAGE);
  }

  return data.map((item) => {
    if (
      !Array.isArray(item) ||
      item.length !== EMBEDDING_DIMENSIONS ||
      !item.every(isFiniteNumber)
    ) {
      throw new Error(UNAVAILABLE_MESSAGE);
    }

    return item;
  });
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length < 1 || texts.length > EMBED_BATCH_SIZE) {
    throw new Error(UNAVAILABLE_MESSAGE);
  }

  let response: Response;
  try {
    response = await fetch(embedUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts }),
      signal: AbortSignal.timeout(EMBED_TIMEOUT_MS),
    });
  } catch {
    throw new Error(UNAVAILABLE_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(UNAVAILABLE_MESSAGE);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(UNAVAILABLE_MESSAGE);
  }

  return parseVectors(body, texts.length);
}
