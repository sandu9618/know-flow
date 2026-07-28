import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../errors/AppError.js';
import { conversationsRepository } from '../repositories/conversations.repository.js';
import { knowledgeSourcesRepository } from '../repositories/knowledge-sources.repository.js';
import type { Conversation } from '../types/conversation.types.js';
import type { KnowledgeSource } from '../types/knowledge-source.types.js';
import { chatService } from './chat.service.js';

const chatMock = vi.fn();
const streamMock = vi.fn();

vi.mock('../repositories/knowledge-sources.repository.js', () => ({
  knowledgeSourcesRepository: {
    findById: vi.fn(),
  },
}));

vi.mock('../repositories/conversations.repository.js', () => ({
  conversationsRepository: {
    findOrCreateBySourceId: vi.fn(),
    appendMessages: vi.fn(),
  },
}));

vi.mock('../clients/llm.client.js', () => ({
  getLlmClient: () => ({
    chat: chatMock,
    stream: streamMock,
    getModelId: () => 'gemini-2.0-flash',
  }),
}));

const indexedSource: KnowledgeSource = {
  id: '6a61e973d923b6f0e248762a',
  sourceType: 'file_upload',
  title: 'Refund Policy EU',
  status: 'indexed',
  sourceConfig: {
    filename: 'refund-policy-eu.txt',
    bucketKey: 'uploads/6a61e973d923b6f0e248762a/refund-policy-eu.txt',
    mimeType: 'text/plain',
    sizeBytes: 128,
  },
  errorMessage: null,
  chunkCount: null,
  extractedText: 'Customers in the EU may request a refund within 14 days of purchase.',
  createdAt: new Date('2026-07-23T10:14:12.001Z'),
  acquiredAt: new Date('2026-07-23T10:14:12.001Z'),
  indexedAt: new Date('2026-07-23T10:14:20.001Z'),
};

const emptyConversation: Conversation = {
  id: 'c0ffee00c0ffee00c0ffee00',
  sourceId: indexedSource.id,
  messages: [],
  createdAt: new Date('2026-07-28T10:00:00.000Z'),
  updatedAt: new Date('2026-07-28T10:00:00.000Z'),
};

async function collectTokens(tokens: AsyncIterable<string>): Promise<string> {
  let result = '';
  for await (const chunk of tokens) {
    result += chunk;
  }
  return result;
}

describe('chatService.askAboutSource', () => {
  beforeEach(() => {
    vi.mocked(knowledgeSourcesRepository.findById).mockReset();
    vi.mocked(conversationsRepository.findOrCreateBySourceId).mockReset();
    vi.mocked(conversationsRepository.appendMessages).mockReset();
    chatMock.mockReset();
    streamMock.mockReset();
  });

  it('calls LlmClient with document text, persists the turn, and returns conversationId', async () => {
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(indexedSource);
    vi.mocked(conversationsRepository.findOrCreateBySourceId).mockResolvedValue(emptyConversation);
    vi.mocked(conversationsRepository.appendMessages).mockResolvedValue({
      ...emptyConversation,
      messages: [
        {
          role: 'user',
          content: 'What is the EU refund policy?',
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: 'EU customers can request a refund within 14 days.',
          citations: [],
          timestamp: new Date(),
        },
      ],
    });
    chatMock.mockResolvedValue({
      content: 'EU customers can request a refund within 14 days.',
      model: 'gemini-2.0-flash',
    });

    const result = await chatService.askAboutSource({
      sourceId: indexedSource.id,
      question: 'What is the EU refund policy?',
    });

    expect(result).toEqual({
      answer: 'EU customers can request a refund within 14 days.',
      sourceId: indexedSource.id,
      model: 'gemini-2.0-flash',
      conversationId: emptyConversation.id,
    });

    expect(chatMock).toHaveBeenCalledTimes(1);
    const [messages] = chatMock.mock.calls[0] as [Array<{ role: string; content: string }>];
    expect(messages[0]?.role).toBe('system');
    expect(messages[0]?.content).toContain(indexedSource.extractedText);
    expect(messages[1]?.role).toBe('user');
    expect(messages[1]?.content).toBe('What is the EU refund policy?');

    expect(conversationsRepository.appendMessages).toHaveBeenCalledWith(
      emptyConversation.id,
      expect.arrayContaining([
        expect.objectContaining({
          role: 'user',
          content: 'What is the EU refund policy?',
        }),
        expect.objectContaining({
          role: 'assistant',
          content: 'EU customers can request a refund within 14 days.',
          citations: [],
        }),
      ]),
    );
  });

  it('includes prior turns when asking a follow-up', async () => {
    const withHistory: Conversation = {
      ...emptyConversation,
      messages: [
        {
          role: 'user',
          content: 'What is the EU refund policy?',
          timestamp: new Date('2026-07-28T10:00:01.000Z'),
        },
        {
          role: 'assistant',
          content: 'EU customers can request a refund within 14 days.',
          citations: [],
          timestamp: new Date('2026-07-28T10:00:02.000Z'),
        },
      ],
    };

    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(indexedSource);
    vi.mocked(conversationsRepository.findOrCreateBySourceId).mockResolvedValue(withHistory);
    vi.mocked(conversationsRepository.appendMessages).mockResolvedValue(withHistory);
    chatMock.mockResolvedValue({
      content: 'It means you have two weeks after purchase.',
      model: 'gemini-2.0-flash',
    });

    await chatService.askAboutSource({
      sourceId: indexedSource.id,
      question: 'Can you elaborate on that?',
    });

    const [messages] = chatMock.mock.calls[0] as [Array<{ role: string; content: string }>];
    expect(messages.map((m) => m.role)).toEqual([
      'system',
      'user',
      'assistant',
      'user',
    ]);
    expect(messages[1]?.content).toBe('What is the EU refund policy?');
    expect(messages[2]?.content).toBe('EU customers can request a refund within 14 days.');
    expect(messages[3]?.content).toBe('Can you elaborate on that?');
  });

  it('throws 404 when the source does not exist', async () => {
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(null);

    await expect(
      chatService.askAboutSource({
        sourceId: 'missing',
        question: 'Hello?',
      }),
    ).rejects.toMatchObject({
      code: 'SOURCE_NOT_FOUND',
      statusCode: 404,
    } satisfies Partial<AppError>);
  });

  it('throws 409 when extracted text is not ready', async () => {
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue({
      ...indexedSource,
      status: 'acquired',
      extractedText: null,
      indexedAt: null,
    });

    await expect(
      chatService.askAboutSource({
        sourceId: indexedSource.id,
        question: 'Hello?',
      }),
    ).rejects.toMatchObject({
      code: 'SOURCE_NOT_READY',
      statusCode: 409,
    } satisfies Partial<AppError>);
  });
});

describe('chatService.createAnswerStream', () => {
  beforeEach(() => {
    vi.mocked(knowledgeSourcesRepository.findById).mockReset();
    vi.mocked(conversationsRepository.findOrCreateBySourceId).mockReset();
    vi.mocked(conversationsRepository.appendMessages).mockReset();
    chatMock.mockReset();
    streamMock.mockReset();
  });

  it('streams tokens with multi-turn context and returns conversationId', async () => {
    const withHistory: Conversation = {
      ...emptyConversation,
      messages: [
        {
          role: 'user',
          content: 'What is the EU refund policy?',
          timestamp: new Date('2026-07-28T10:00:01.000Z'),
        },
        {
          role: 'assistant',
          content: 'EU customers can request a refund within 14 days.',
          citations: [],
          timestamp: new Date('2026-07-28T10:00:02.000Z'),
        },
      ],
    };

    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(indexedSource);
    vi.mocked(conversationsRepository.findOrCreateBySourceId).mockResolvedValue(withHistory);
    streamMock.mockReturnValue({
      async *[Symbol.asyncIterator]() {
        yield 'It means ';
        yield 'two weeks.';
      },
    });

    const handle = await chatService.createAnswerStream({
      sourceId: indexedSource.id,
      question: 'Can you elaborate on that?',
    });

    expect(handle.conversationId).toBe(withHistory.id);
    expect(handle.sourceId).toBe(indexedSource.id);
    expect(handle.model).toBe('gemini-2.0-flash');

    const answer = await collectTokens(handle.tokens);
    expect(answer).toBe('It means two weeks.');

    const [messages] = streamMock.mock.calls[0] as [Array<{ role: string; content: string }>];
    expect(messages.map((m) => m.role)).toEqual([
      'system',
      'user',
      'assistant',
      'user',
    ]);
    expect(messages[3]?.content).toBe('Can you elaborate on that?');
  });
});

describe('chatService.persistTurn', () => {
  beforeEach(() => {
    vi.mocked(conversationsRepository.appendMessages).mockReset();
  });

  it('appends user and assistant messages with empty citations', async () => {
    vi.mocked(conversationsRepository.appendMessages).mockResolvedValue(emptyConversation);

    await chatService.persistTurn({
      conversationId: emptyConversation.id,
      question: 'Hello?',
      answer: 'Hi there.',
    });

    expect(conversationsRepository.appendMessages).toHaveBeenCalledWith(
      emptyConversation.id,
      [
        expect.objectContaining({
          role: 'user',
          content: 'Hello?',
        }),
        expect.objectContaining({
          role: 'assistant',
          content: 'Hi there.',
          citations: [],
        }),
      ],
    );
  });

  it('rejects empty answers', async () => {
    await expect(
      chatService.persistTurn({
        conversationId: emptyConversation.id,
        question: 'Hello?',
        answer: '   ',
      }),
    ).rejects.toMatchObject({
      code: 'LLM_EMPTY_RESPONSE',
      statusCode: 502,
    } satisfies Partial<AppError>);

    expect(conversationsRepository.appendMessages).not.toHaveBeenCalled();
  });
});
