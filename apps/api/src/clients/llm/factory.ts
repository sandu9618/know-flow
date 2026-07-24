import { config } from '../../config.js';
import { AppError } from '../../errors/AppError.js';
import { createGeminiLlmClient } from './gemini.client.js';
import type { LlmClient } from './types.js';

let cachedClient: LlmClient | null = null;

export function getLlmClient(): LlmClient {
  if (cachedClient) {
    return cachedClient;
  }

  const provider = config.llmProvider;
  const apiKey = config.llmApiKey;
  const model = config.llmChatModel;

  if (provider === 'gemini') {
    cachedClient = createGeminiLlmClient({ apiKey, model });
    return cachedClient;
  }

  throw new AppError(
    'LLM_PROVIDER_UNSUPPORTED',
    `Unsupported LLM_PROVIDER: ${provider}. Supported: gemini`,
    503,
  );
}

export function resetLlmClientForTests(): void {
  cachedClient = null;
}
