import type { CitationDto } from '../types/citation.types.js';
import type { Conversation, ConversationDto } from '../types/conversation.types.js';

export function toConversationDto(
  conversation: Conversation,
  citationsByChunkId: Map<string, CitationDto> = new Map(),
): ConversationDto {
  return {
    id: conversation.id,
    sourceId: conversation.sourceId,
    messages: conversation.messages.map((message) => ({
      role: message.role,
      content: message.content,
      timestamp: message.timestamp.toISOString(),
      ...(message.role === 'assistant'
        ? {
            citations: (message.citations ?? [])
              .map((chunkId) => citationsByChunkId.get(chunkId))
              .filter((citation): citation is CitationDto => citation !== undefined),
          }
        : {}),
    })),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}
