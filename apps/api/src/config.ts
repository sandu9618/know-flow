import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
import type { BucketProvider } from './clients/bucket/types.js';

loadEnv({ path: resolve(process.cwd(), '../../.env') });
loadEnv({ path: resolve(process.cwd(), '.env') });

function parseBucketProvider(value: string | undefined): BucketProvider {
  if (value === 's3' || value === 'local') {
    return value;
  }

  return 'local';
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/knowflow',
  mongodb: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  },
  llmProvider: process.env.LLM_PROVIDER ?? 'gemini',
  llmApiKey: process.env.LLM_API_KEY ?? '',
  llmChatModel: process.env.LLM_CHAT_MODEL ?? 'gemini-2.0-flash',
  pythonWorkerUrl: process.env.PYTHON_WORKER_URL ?? 'http://localhost:8000',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  bucket: {
    provider: parseBucketProvider(process.env.BUCKET_PROVIDER),
    localPath:
      process.env.BUCKET_LOCAL_PATH ?? resolve(process.cwd(), '../../.local/bucket'),
    region: process.env.BUCKET_REGION ?? 'us-east-1',
    name: process.env.BUCKET_NAME ?? 'knowflow-uploads',
    accessKey: process.env.BUCKET_ACCESS_KEY ?? '',
    secretKey: process.env.BUCKET_SECRET_KEY ?? '',
    endpoint: process.env.BUCKET_ENDPOINT ?? '',
  },
} as const;

export function validateStartupConfig(): void {
  if (Number.isNaN(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}`);
  }

  if (!config.mongodbUri.trim()) {
    throw new Error('MONGODB_URI is required. Set it in .env (see .env.example).');
  }
}
