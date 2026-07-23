export { createBucketClient, getBucketClient, resetBucketClientForTests } from './bucket/factory.js';
export type { BucketClient, BucketProvider, UploadObjectInput } from './bucket/types.js';

import { getBucketClient } from './bucket/factory.js';

export const bucketClient = getBucketClient();
