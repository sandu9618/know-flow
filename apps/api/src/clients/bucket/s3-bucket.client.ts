import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { config } from '../../config.js';
import type { BucketClient } from './types.js';

async function bodyToBuffer(body: unknown): Promise<Buffer> {
  if (!body) {
    throw new Error('Empty S3 object body');
  }

  if (Buffer.isBuffer(body)) {
    return body;
  }

  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }

  if (typeof body === 'string') {
    return Buffer.from(body);
  }

  if (
    typeof body === 'object' &&
    body !== null &&
    'transformToByteArray' in body &&
    typeof (body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray ===
      'function'
  ) {
    const bytes = await (
      body as { transformToByteArray: () => Promise<Uint8Array> }
    ).transformToByteArray();
    return Buffer.from(bytes);
  }

  throw new Error('Unsupported S3 object body type');
}

export function createS3BucketClient(): BucketClient {
  let s3Client: S3Client | null = null;
  let bucketReady = false;

  function getS3Client(): S3Client {
    if (s3Client) {
      return s3Client;
    }

    const { bucket } = config;
    const useCustomEndpoint = Boolean(bucket.endpoint);

    s3Client = new S3Client({
      region: bucket.region,
      endpoint: useCustomEndpoint ? bucket.endpoint : undefined,
      forcePathStyle: useCustomEndpoint,
      credentials:
        bucket.accessKey && bucket.secretKey
          ? {
              accessKeyId: bucket.accessKey,
              secretAccessKey: bucket.secretKey,
            }
          : undefined,
    });

    return s3Client;
  }

  async function ensureBucketExists(): Promise<void> {
    if (bucketReady) {
      return;
    }

    const client = getS3Client();
    const bucketName = config.bucket.name;

    try {
      await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch {
      await client.send(new CreateBucketCommand({ Bucket: bucketName }));
    }

    bucketReady = true;
  }

  return {
    async uploadObject(input) {
      await ensureBucketExists();

      await getS3Client().send(
        new PutObjectCommand({
          Bucket: config.bucket.name,
          Key: input.key,
          Body: input.body,
          ContentType: input.mimeType,
        }),
      );
    },

    async downloadObject(key) {
      await ensureBucketExists();

      const result = await getS3Client().send(
        new GetObjectCommand({
          Bucket: config.bucket.name,
          Key: key,
        }),
      );

      return bodyToBuffer(result.Body);
    },

    async deleteObject(key) {
      await getS3Client().send(
        new DeleteObjectCommand({
          Bucket: config.bucket.name,
          Key: key,
        }),
      );
    },
  };
}
