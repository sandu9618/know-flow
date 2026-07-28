import { ApiError, fetchJson, getApiBaseUrl } from '@/lib/api';
import type {
  AskChatRequest,
  AskChatResponse,
  ChatStreamEvent,
  ConversationDto,
} from '@/types/chat.types';

export async function askChat(request: AskChatRequest): Promise<AskChatResponse> {
  const response = await fetchJson<{ data: AskChatResponse }>('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return response.data;
}

export async function getConversationBySourceId(
  sourceId: string,
): Promise<ConversationDto | null> {
  const params = new URLSearchParams({ sourceId });
  const response = await fetchJson<{ data: ConversationDto | null }>(
    `/api/conversations?${params.toString()}`,
  );
  return response.data;
}

type StreamChatOptions = {
  signal?: AbortSignal;
  onEvent: (event: ChatStreamEvent) => void;
};

function parseSseChunk(buffer: string): { events: ChatStreamEvent[]; rest: string } {
  const parts = buffer.split('\n\n');
  const rest = parts.pop() ?? '';
  const events: ChatStreamEvent[] = [];

  for (const part of parts) {
    const dataLines = part
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart());

    if (dataLines.length === 0) {
      continue;
    }

    const payload = dataLines.join('\n');
    if (!payload) {
      continue;
    }

    const parsed = JSON.parse(payload) as ChatStreamEvent;
    events.push(parsed);
  }

  return { events, rest };
}

export async function streamChat(
  request: AskChatRequest,
  options: StreamChatOptions,
): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/chat/stream`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal: options.signal,
  });

  if (!response.ok) {
    let code: string | undefined;
    let message = `Request failed with status ${response.status}`;

    try {
      const body = (await response.json()) as {
        error?: { code?: string; message?: string };
      };
      code = body.error?.code;
      if (body.error?.message) {
        message = body.error.message;
      }
    } catch {
      // Non-JSON error body — keep status message
    }

    throw new ApiError(message, response.status, code);
  }

  if (!response.body) {
    throw new ApiError('Streaming response body is missing', 502, 'LLM_PROVIDER_ERROR');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let sawDone = false;
  let streamError: ApiError | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSseChunk(buffer);
    buffer = parsed.rest;

    for (const event of parsed.events) {
      options.onEvent(event);

      if (event.type === 'done') {
        sawDone = true;
      }

      if (event.type === 'error') {
        streamError = new ApiError(event.message, 502, event.code);
      }
    }
  }

  if (buffer.trim()) {
    const parsed = parseSseChunk(`${buffer}\n\n`);
    for (const event of parsed.events) {
      options.onEvent(event);
      if (event.type === 'done') {
        sawDone = true;
      }
      if (event.type === 'error') {
        streamError = new ApiError(event.message, 502, event.code);
      }
    }
  }

  if (streamError) {
    throw streamError;
  }

  if (!sawDone && !options.signal?.aborted) {
    throw new ApiError(
      'The AI service could not answer right now. Please try again shortly.',
      502,
      'LLM_PROVIDER_ERROR',
    );
  }
}
