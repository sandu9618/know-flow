import type { Readable } from 'node:stream';

export type UploadObjectInput = {
  key: string;
  body: Buffer;
  mimeType: string;
};

export type BucketClient = {
  uploadObject(input: UploadObjectInput): Promise<void>;
  downloadObject(key: string): Promise<Buffer>;
  createReadStream(key: string): Promise<Readable>;
  deleteObject(key: string): Promise<void>;
};

export type BucketProvider = 'local' | 's3';
