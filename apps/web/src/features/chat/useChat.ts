import { useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api';
import { getConversationBySourceId, streamChat } from '@/features/chat/chat.api';
import type { ChatMessage, ConversationMessageDto } from '@/types/chat.types';

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toUiMessages(messages: ConversationMessageDto[]): ChatMessage[] {
  return messages.map((message, index) => ({
    id: `${message.timestamp}-${message.role}-${index}`,
    role: message.role,
    content: message.content,
    ...(message.role === 'assistant'
      ? { citations: message.citations ?? [] }
      : {}),
  }));
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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const historyRequestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function abortActiveStream(): void {
    abortRef.current?.abort();
    abortRef.current = null;
  }

  async function loadHistory(nextSourceId: string): Promise<void> {
    if (!nextSourceId) {
      setConversationId(null);
      setMessages([]);
      setIsLoadingHistory(false);
      return;
    }

    const requestId = ++historyRequestIdRef.current;
    setIsLoadingHistory(true);

    try {
      const conversation = await getConversationBySourceId(nextSourceId);
      if (requestId !== historyRequestIdRef.current) {
        return;
      }

      if (conversation) {
        setConversationId(conversation.id);
        setMessages(toUiMessages(conversation.messages));
      } else {
        setConversationId(null);
        setMessages([]);
      }
    } catch (err: unknown) {
      if (requestId !== historyRequestIdRef.current) {
        return;
      }
      setConversationId(null);
      setMessages([]);
      setError(toUserFacingChatError(err) || 'Failed to load conversation history.');
    } finally {
      if (requestId === historyRequestIdRef.current) {
        setIsLoadingHistory(false);
      }
    }
  }

  function setSourceId(nextSourceId: string) {
    abortActiveStream();
    setSourceIdState(nextSourceId);
    setDraft('');
    setError(null);
    setIsStreaming(false);
    setStreamingMessageId(null);
    setConversationId(null);
    setMessages([]);
    void loadHistory(nextSourceId);
  }

  async function sendMessage(): Promise<void> {
    const question = draft.trim();
    if (!question || !sourceId || isStreaming || isLoadingHistory) {
      return;
    }

    abortActiveStream();

    const userMessageId = createMessageId();
    const assistantId = createMessageId();
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: question,
    };
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      citations: [],
    };

    const controller = new AbortController();
    abortRef.current = controller;

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setDraft('');
    setError(null);
    setIsStreaming(true);
    setStreamingMessageId(assistantId);

    try {
      await streamChat(
        { sourceId, question },
        {
          signal: controller.signal,
          onEvent: (event) => {
            if (event.type === 'token') {
              setMessages((prev) =>
                prev.map((message) =>
                  message.id === assistantId
                    ? { ...message, content: message.content + event.text }
                    : message,
                ),
              );
            }

            if (event.type === 'done') {
              setConversationId(event.conversationId);
            }
          },
        },
      );
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        // Incomplete turn is not persisted — drop local optimistic messages
        setMessages((prev) =>
          prev.filter((message) => message.id !== assistantId && message.id !== userMessageId),
        );
      } else {
        const message = toUserFacingChatError(err);
        if (message) {
          setError(message);
        }

        setMessages((prev) =>
          prev.filter((message) => message.id !== assistantId && message.id !== userMessageId),
        );
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
    conversationId,
    messages,
    draft,
    setDraft,
    isStreaming,
    isLoadingHistory,
    streamingMessageId,
    error,
    sendMessage,
  };
}
