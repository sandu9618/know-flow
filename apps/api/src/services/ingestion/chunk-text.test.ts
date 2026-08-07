import { describe, expect, it } from 'vitest';

import { CHARS_PER_TOKEN, MAX_CHUNK_CHARS, MIN_CHUNK_CHARS } from '../../constants/ingestion.constants.js';
import { chunkText, estimateTokenCount } from './chunk-text.js';

describe('estimateTokenCount', () => {
  it('uses the chars-per-token heuristic', () => {
    expect(estimateTokenCount('abcd')).toBe(1);
    expect(estimateTokenCount('a'.repeat(CHARS_PER_TOKEN * 2))).toBe(2);
  });
});

describe('chunkText', () => {
  it('returns an empty array for blank text', () => {
    expect(chunkText('   ')).toEqual([]);
  });

  it('returns a single chunk for short text', () => {
    const text = 'Short policy summary.';
    const chunks = chunkText(text);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({
      index: 0,
      text,
      tokenCount: estimateTokenCount(text),
    });
  });

  it('splits long text into multiple chunks within size targets', () => {
    const paragraph = 'Sentence one. '.repeat(400).trim();
    const text = `${paragraph}\n\n${paragraph}`;
    const chunks = chunkText(text);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.text.length <= MAX_CHUNK_CHARS)).toBe(true);
    expect(chunks.every((chunk, index) => chunk.index === index)).toBe(true);
    expect(chunks.some((chunk) => chunk.text.length >= MIN_CHUNK_CHARS)).toBe(true);
  });

  it('preserves paragraph boundaries when possible', () => {
    const first = 'Alpha paragraph.';
    const second = 'Beta paragraph.';
    const chunks = chunkText(`${first}\n\n${second}`);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.text).toContain(first);
    expect(chunks[0]?.text).toContain(second);
  });
});
