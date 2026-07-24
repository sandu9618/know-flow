import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { askChat } from '@/features/chat/chat.api';
import type { ChatMessage } from '@/types/chat.types';

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toUserFacingChatError(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.code) {
      case 'LLM_RATE_LIMITED':
        return 'The AI service is temporarily rate-limited. Please wait a minute and try again.';
      case 'LLM_NOT_CONFIGURED':
        return 'Chat is not configured correctly. Check LLM_API_KEY and try again.';
      case 'LLM_MODEL_UNAVAILABLE':
        return 'The configured chat model is unavailable. Check LLM_CHAT_MODEL.';
      case 'SOURCE_NOT_READY':
        return 'This document is not ready for chat yet. Wait until indexing completes.';
      case 'SOURCE_NOT_FOUND':
        return 'The selected document could not be found.';
      case 'LLM_PROVIDER_ERROR':
      case 'LLM_EMPTY_RESPONSE':
        return 'The AI service could not answer right now. Please try again shortly.';
      default:
        break;
    }

    if (err.status === 429) {
      return 'The AI service is temporarily rate-limited. Please wait a minute and try again.';
    }

    // Avoid rendering long provider dumps if an older API response slips through
    if (err.message.length > 160 || /GoogleGenerativeAI|generativelanguage\.googleapis/i.test(err.message)) {
      return 'Something went wrong while getting an answer. Please try again.';
    }

    return err.message;
  }

  if (err instanceof Error && err.message.trim()) {
    return err.message.length > 160
      ? 'Something went wrong while getting an answer. Please try again.'
      : err.message;
  }

  return 'Failed to get an answer. Please try again.';
}

export function useChat() {
  const [sourceId, setSourceIdState] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setSourceId(nextSourceId: string) {
    setSourceIdState(nextSourceId);
    setMessages([]);
    setDraft('');
    setError(null);
  }

  async function sendMessage(): Promise<void> {
    const question = draft.trim();
    if (!question || !sourceId || isAsking) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setError(null);
    setIsAsking(true);

    try {
      const result = await askChat({ sourceId, question });
      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: 'assistant',
        content: result.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      setError(toUserFacingChatError(err));
    } finally {
      setIsAsking(false);
    }
  }

  return {
    sourceId,
    setSourceId,
    messages,
    draft,
    setDraft,
    isAsking,
    error,
    sendMessage,
  };
}
