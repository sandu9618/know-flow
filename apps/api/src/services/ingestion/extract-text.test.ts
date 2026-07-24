import { describe, expect, it } from 'vitest';

import { extractTextFromBuffer } from './extract-text.js';

describe('extractTextFromBuffer', () => {
  it('returns UTF-8 text for text/plain buffers', async () => {
    const text = await extractTextFromBuffer(
      Buffer.from('EU refunds within 14 days.', 'utf8'),
      'text/plain',
    );

    expect(text).toBe('EU refunds within 14 days.');
  });

  it('rejects empty TXT files', async () => {
    await expect(
      extractTextFromBuffer(Buffer.from('   ', 'utf8'), 'text/plain'),
    ).rejects.toThrow('TXT file is empty');
  });

  it('rejects unsupported mime types', async () => {
    await expect(
      extractTextFromBuffer(Buffer.from('x'), 'application/msword'),
    ).rejects.toThrow('Unsupported mime type');
  });
});
