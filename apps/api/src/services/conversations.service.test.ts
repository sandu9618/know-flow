import { beforeEach, describe, expect, it, vi } from 'vitest';

import { conversationsRepository } from '../repositories/conversations.repository.js';
import { loadCitationMap } from '../services/rag/hydrate-citations.service.js';
import type { Conversation } from '../types/conversation.types.js';
import { conversationsService } from './conversations.service.js';

vi.mock('../repositories/conversations.repository.js', () => ({
  conversationsRepository: {
    findBySourceId: vi.fn(),
  },
}));

vi.mock('../services/rag/hydrate-citations.service.js', () => ({
  loadCitationMap: vi.fn(),
}));

const conversation: Conversation = {
  id: 'c0ffee00c0ffee00c0ffee00',
  sourceId: '6a61e973d923b6f0e248762a',
  messages: [
    {
      role: 'user',
      content: 'What is the refund policy?',
      timestamp: new Date('2026-07-28T10:00:01.000Z'),
    },
    {
      role: 'assistant',
      content: 'Within 14 days.',
      citations: ['aaaaaaaaaaaaaaaaaaaaaaaa', 'missingchunkid0000000000'],
      timestamp: new Date('2026-07-28T10:00:02.000Z'),
    },
  ],
  createdAt: new Date('2026-07-28T10:00:00.000Z'),
  updatedAt: new Date('2026-07-28T10:00:02.000Z'),
};

describe('conversationsService.getBySourceId', () => {
  beforeEach(() => {
    vi.mocked(conversationsRepository.findBySourceId).mockReset();
    vi.mocked(loadCitationMap).mockReset();
  });

  it('returns null when no conversation exists', async () => {
    vi.mocked(conversationsRepository.findBySourceId).mockResolvedValue(null);

    await expect(
      conversationsService.getBySourceId(conversation.sourceId),
    ).resolves.toBeNull();
    expect(loadCitationMap).not.toHaveBeenCalled();
  });

  it('hydrates assistant citations and omits unresolved chunk IDs', async () => {
    vi.mocked(conversationsRepository.findBySourceId).mockResolvedValue(conversation);
    vi.mocked(loadCitationMap).mockResolvedValue(
      new Map([
        [
          'aaaaaaaaaaaaaaaaaaaaaaaa',
          {
            chunkId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
            sourceId: conversation.sourceId,
            sourceTitle: 'Refund Policy',
            chunkIndex: 0,
            text: 'Refund within 14 days.',
          },
        ],
      ]),
    );

    const result = await conversationsService.getBySourceId(conversation.sourceId);

    expect(loadCitationMap).toHaveBeenCalledWith([
      'aaaaaaaaaaaaaaaaaaaaaaaa',
      'missingchunkid0000000000',
    ]);
    expect(result?.messages[1]?.citations).toEqual([
      {
        chunkId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        sourceId: conversation.sourceId,
        sourceTitle: 'Refund Policy',
        chunkIndex: 0,
        text: 'Refund within 14 days.',
      },
    ]);
  });
});
