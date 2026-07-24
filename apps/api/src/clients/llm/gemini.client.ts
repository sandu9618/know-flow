import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../../errors/AppError.js';
import type { LlmChatOptions, LlmChatResult, LlmClient, LlmMessage } from './types.js';

function toGeminiContents(messages: LlmMessage[]): {
  systemInstruction?: string;
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
} {
  const systemParts = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content.trim())
    .filter(Boolean);

  const contents = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: message.content }],
    }));

  return {
    systemInstruction: systemParts.length > 0 ? systemParts.join('\n\n') : undefined,
    contents,
  };
}

function extractProviderStatus(error: unknown): number | null {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as { status?: unknown; statusCode?: unknown };
    if (typeof candidate.status === 'number') {
      return candidate.status;
    }
    if (typeof candidate.statusCode === 'number') {
      return candidate.statusCode;
    }
  }

  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/\[(\d{3})\s/);
  if (!match?.[1]) {
    return null;
  }

  return Number(match[1]);
}

function toProviderAppError(error: unknown): AppError {
  const status = extractProviderStatus(error);
  const rawMessage = error instanceof Error ? error.message : String(error);

  console.error('[llm:gemini]', rawMessage);

  if (status === 429 || /quota|rate limit|too many requests/i.test(rawMessage)) {
    return new AppError(
      'LLM_RATE_LIMITED',
      'The AI service is temporarily rate-limited. Please wait a minute and try again.',
      429,
    );
  }

  if (status === 401 || status === 403 || /api key not valid|api_key_invalid|permission/i.test(rawMessage)) {
    return new AppError(
      'LLM_NOT_CONFIGURED',
      'Chat is not configured correctly. Check LLM_API_KEY and try again.',
      503,
    );
  }

  if (status === 404 || /not found|is not found for API version/i.test(rawMessage)) {
    return new AppError(
      'LLM_MODEL_UNAVAILABLE',
      'The configured chat model is unavailable. Check LLM_CHAT_MODEL.',
      503,
    );
  }

  return new AppError(
    'LLM_PROVIDER_ERROR',
    'The AI service could not answer right now. Please try again shortly.',
    503,
  );
}

export function createGeminiLlmClient(input: {
  apiKey: string;
  model: string;
}): LlmClient {
  const genAI = new GoogleGenerativeAI(input.apiKey);
  const modelId = input.model;

  return {
    getModelId() {
      return modelId;
    },

    async chat(messages: LlmMessage[], options?: LlmChatOptions): Promise<LlmChatResult> {
      if (!input.apiKey.trim() || input.apiKey === 'your-api-key-here') {
        throw new AppError(
          'LLM_NOT_CONFIGURED',
          'Chat is not configured correctly. Check LLM_API_KEY and try again.',
          503,
        );
      }

      const { systemInstruction, contents } = toGeminiContents(messages);

      if (contents.length === 0) {
        throw new AppError('LLM_INVALID_REQUEST', 'At least one user message is required', 400);
      }

      try {
        const model = genAI.getGenerativeModel({
          model: modelId,
          systemInstruction,
        });

        const result = await model.generateContent({
          contents,
          generationConfig: {
            temperature: options?.temperature,
            maxOutputTokens: options?.maxOutputTokens,
          },
        });

        const content = result.response.text().trim();
        if (!content) {
          throw new AppError(
            'LLM_EMPTY_RESPONSE',
            'The AI service returned an empty answer. Please try again.',
            502,
          );
        }

        return { content, model: modelId };
      } catch (error: unknown) {
        if (error instanceof AppError) {
          throw error;
        }

        throw toProviderAppError(error);
      }
    },
  };
}
