import { conversationsRepository } from '../repositories/conversations.repository.js';
import { toConversationDto } from '../mappers/conversation.mapper.js';
import type { ConversationDto } from '../types/conversation.types.js';

export const conversationsService = {
  async getBySourceId(sourceId: string): Promise<ConversationDto | null> {
    const conversation = await conversationsRepository.findBySourceId(sourceId);
    return conversation ? toConversationDto(conversation) : null;
  },
};
