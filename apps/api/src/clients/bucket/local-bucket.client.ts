import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import type { BucketClient } from './types.js';

export function createLocalBucketClient(rootPath: string): BucketClient {
  const basePath = resolve(rootPath);

  async function resolveObjectPath(key: string): Promise<string> {
    const objectPath = resolve(basePath, key);
    if (!objectPath.startsWith(basePath)) {
      throw new Error('Invalid object key');
    }

    return objectPath;
  }

  return {
    async uploadObject(input) {
      const objectPath = await resolveObjectPath(input.key);
      await mkdir(dirname(objectPath), { recursive: true });
      await writeFile(objectPath, input.body);
    },

    async deleteObject(key) {
      const objectPath = await resolveObjectPath(key);
      await unlink(objectPath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      });
    },
  };
}
