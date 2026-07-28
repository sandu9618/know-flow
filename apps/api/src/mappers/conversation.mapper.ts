import type { Conversation, ConversationDto } from '../types/conversation.types.js';

export function toConversationDto(conversation: Conversation): ConversationDto {
  return {
    id: conversation.id,
    sourceId: conversation.sourceId,
    messages: conversation.messages.map((message) => ({
      role: message.role,
      content: message.content,
      timestamp: message.timestamp.toISOString(),
      ...(message.role === 'assistant'
        ? { citations: message.citations ?? [] }
        : {}),
    })),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}
