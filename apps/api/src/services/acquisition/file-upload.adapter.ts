import { extname } from 'node:path';
import type { FileUploadSourceConfig } from '../../types/knowledge-source.types.js';

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
