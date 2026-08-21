import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { extractTextFromBuffer, extractTextFromPath } from './extract-text.js';

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

describe('extractTextFromPath', () => {
  let tempDir = '';

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('reads UTF-8 text from a file path', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'knowflow-extract-'));
    const filePath = join(tempDir, 'policy.txt');
    await writeFile(filePath, 'EU refunds within 14 days.\n', 'utf8');

    const text = await extractTextFromPath(filePath, 'text/plain');

    expect(text).toBe('EU refunds within 14 days.');
  });

  it('rejects empty TXT files on disk', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'knowflow-extract-'));
    const filePath = join(tempDir, 'empty.txt');
    await writeFile(filePath, '   ', 'utf8');

    await expect(extractTextFromPath(filePath, 'text/plain')).rejects.toThrow(
      'TXT file is empty',
    );
  });
});
