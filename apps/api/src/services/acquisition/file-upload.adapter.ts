import { createWriteStream } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, extname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { bucketClient } from '../../clients/bucket.client.js';
import type { FileUploadSourceConfig, KnowledgeSource } from '../../types/knowledge-source.types.js';
import { extractTextFromPath } from '../ingestion/extract-text.js';

export function buildBucketKey(sourceId: string, filename: string): string {
  const safeFilename = filename.replace(/[/\\]/g, '_');
  return `uploads/${sourceId}/${safeFilename}`;
}

export function deriveTitle(filename: string, override?: string): string {
  if (override?.trim()) {
    return override.trim();
  }

  const extension = extname(filename);
  if (!extension) {
    return filename;
  }

  return filename.slice(0, -extension.length);
}

export function buildFileUploadSourceConfig(input: {
  sourceId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}): FileUploadSourceConfig {
  return {
    filename: input.filename,
    bucketKey: buildBucketKey(input.sourceId, input.filename),
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
  };
}

export async function resolveFileUploadText(source: KnowledgeSource): Promise<string> {
  const { bucketKey, mimeType, filename } = source.sourceConfig;
  const tempDir = await mkdtemp(join(tmpdir(), 'knowflow-ingest-'));
  const destPath = join(tempDir, basename(filename) || 'source');

  try {
    const objectStream = await bucketClient.createReadStream(bucketKey);
    await pipeline(objectStream, createWriteStream(destPath));
    return await extractTextFromPath(destPath, mimeType);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
