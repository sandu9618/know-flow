import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../errors/AppError.js';
import { knowledgeSourcesRepository } from '../repositories/knowledge-sources.repository.js';
import type { KnowledgeSource } from '../types/knowledge-source.types.js';
import { chatService } from './chat.service.js';

const chatMock = vi.fn();

vi.mock('../repositories/knowledge-sources.repository.js', () => ({
  knowledgeSourcesRepository: {
    findById: vi.fn(),
  },
}));

vi.mock('../clients/llm.client.js', () => ({
  getLlmClient: () => ({
    chat: chatMock,
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

describe('chatService.askAboutSource', () => {
  beforeEach(() => {
    vi.mocked(knowledgeSourcesRepository.findById).mockReset();
    chatMock.mockReset();
  });

  it('calls LlmClient with document text and returns the answer', async () => {
    vi.mocked(knowledgeSourcesRepository.findById).mockResolvedValue(indexedSource);
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
    });

    expect(chatMock).toHaveBeenCalledTimes(1);
    const [messages] = chatMock.mock.calls[0] as [Array<{ role: string; content: string }>];
    expect(messages[0]?.role).toBe('system');
    expect(messages[1]?.content).toContain(indexedSource.extractedText);
    expect(messages[1]?.content).toContain('What is the EU refund policy?');
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
