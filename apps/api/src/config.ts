import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

loadEnv({ path: resolve(process.cwd(), '../../.env') });
loadEnv({ path: resolve(process.cwd(), '.env') });

export const config = {
  port: Number(process.env.PORT ?? 3000),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/knowflow',
  mongodb: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  },
  llmProvider: process.env.LLM_PROVIDER ?? 'gemini',
  llmApiKey: process.env.LLM_API_KEY ?? '',
  pythonWorkerUrl: process.env.PYTHON_WORKER_URL ?? 'http://localhost:8000',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
} as const;

export function validateStartupConfig(): void {
  if (Number.isNaN(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}`);
  }

  if (!config.mongodbUri.trim()) {
    throw new Error('MONGODB_URI is required. Set it in .env (see .env.example).');
  }
}
