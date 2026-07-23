import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { config } from '../../config.js';
import type { BucketClient } from './types.js';

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
