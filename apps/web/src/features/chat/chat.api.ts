import { fetchJson } from '@/lib/api';
import type { AskChatRequest, AskChatResponse } from '@/types/chat.types';

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
