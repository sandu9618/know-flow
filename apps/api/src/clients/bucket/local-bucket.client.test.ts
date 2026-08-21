import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { afterEach, describe, expect, it } from 'vitest';

import { createLocalBucketClient } from './local-bucket.client.js';

describe('createLocalBucketClient', () => {
  let rootPath = '';

  afterEach(async () => {
    if (rootPath) {
      await rm(rootPath, { recursive: true, force: true });
      rootPath = '';
    }
  });

  it('createReadStream yields uploaded object bytes', async () => {
    rootPath = await mkdtemp(join(tmpdir(), 'knowflow-bucket-'));
    const client = createLocalBucketClient(rootPath);
    await client.uploadObject({
      key: 'uploads/policy.txt',
      body: Buffer.from('hello from bucket', 'utf8'),
      mimeType: 'text/plain',
    });

    const stream = await client.createReadStream('uploads/policy.txt');
    expect(stream).toBeInstanceOf(Readable);

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    expect(Buffer.concat(chunks).toString('utf8')).toBe('hello from bucket');
  });
});
