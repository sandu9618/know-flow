import { config } from '../../config.js';
import { createLocalBucketClient } from './local-bucket.client.js';
import { createS3BucketClient } from './s3-bucket.client.js';
import type { BucketClient, BucketProvider } from './types.js';

export function createBucketClient(provider: BucketProvider = config.bucket.provider): BucketClient {
  switch (provider) {
    case 'local':
      return createLocalBucketClient(config.bucket.localPath);
    case 's3':
      return createS3BucketClient();
    default: {
      const exhaustiveCheck: never = provider;
      throw new Error(`Unsupported BUCKET_PROVIDER: ${String(exhaustiveCheck)}`);
    }
  }
}

let bucketClientInstance: BucketClient | null = null;

export function getBucketClient(): BucketClient {
  if (!bucketClientInstance) {
    bucketClientInstance = createBucketClient();
  }

  return bucketClientInstance;
}

export function resetBucketClientForTests(): void {
  bucketClientInstance = null;
}
