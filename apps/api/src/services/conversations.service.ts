import { toConversationDto } from '../mappers/conversation.mapper.js';
import { conversationsRepository } from '../repositories/conversations.repository.js';
import { loadCitationMap } from '../services/rag/hydrate-citations.service.js';
import type { ConversationDto } from '../types/conversation.types.js';

export const conversationsService = {
  async getBySourceId(sourceId: string): Promise<ConversationDto | null> {
    const conversation = await conversationsRepository.findBySourceId(sourceId);
    if (!conversation) {
      return null;
    }

    const chunkIds = conversation.messages.flatMap((message) =>
      message.role === 'assistant' ? (message.citations ?? []) : [],
    );
    const citationsByChunkId = await loadCitationMap(chunkIds);

    return toConversationDto(conversation, citationsByChunkId);
  },
};
