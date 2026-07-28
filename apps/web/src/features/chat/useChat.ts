import { useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api';
import { streamChat } from '@/features/chat/chat.api';
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

  if (err instanceof DOMException && err.name === 'AbortError') {
    return '';
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
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function abortActiveStream(): void {
    abortRef.current?.abort();
    abortRef.current = null;
  }

  function setSourceId(nextSourceId: string) {
    abortActiveStream();
    setSourceIdState(nextSourceId);
    setMessages([]);
    setDraft('');
    setError(null);
    setIsStreaming(false);
    setStreamingMessageId(null);
  }

  async function sendMessage(): Promise<void> {
    const question = draft.trim();
    if (!question || !sourceId || isStreaming) {
      return;
    }

    abortActiveStream();

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content: question,
    };
    const assistantId = createMessageId();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
    };

    const controller = new AbortController();
    abortRef.current = controller;

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setDraft('');
    setError(null);
    setIsStreaming(true);
    setStreamingMessageId(assistantId);

    let receivedText = false;

    try {
      await streamChat(
        { sourceId, question },
        {
          signal: controller.signal,
          onEvent: (event) => {
            if (event.type === 'token') {
              receivedText = true;
              setMessages((prev) =>
                prev.map((message) =>
                  message.id === assistantId
                    ? { ...message, content: message.content + event.text }
                    : message,
                ),
              );
            }
          },
        },
      );
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        setMessages((prev) =>
          prev.filter((message) => {
            if (message.id !== assistantId) {
              return true;
            }
            return message.content.trim().length > 0;
          }),
        );
      } else {
        const message = toUserFacingChatError(err);
        if (message) {
          setError(message);
        }

        if (!receivedText) {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        }
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setIsStreaming(false);
      setStreamingMessageId(null);
    }
  }

  return {
    sourceId,
    setSourceId,
    messages,
    draft,
    setDraft,
    isStreaming,
    streamingMessageId,
    error,
    sendMessage,
  };
}
