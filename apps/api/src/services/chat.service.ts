import { getLlmClient } from '../clients/llm.client.js';
import type { LlmMessage } from '../clients/llm/types.js';
import { AppError } from '../errors/AppError.js';
import { knowledgeSourcesRepository } from '../repositories/knowledge-sources.repository.js';
import type { KnowledgeSource } from '../types/knowledge-source.types.js';

const SYSTEM_INSTRUCTION =
  'You are a helpful assistant that answers questions using only the provided document. ' +
  'If the answer is not in the document, say you do not know based on the document. ' +
  'Do not invent facts that are not supported by the document text.';

export type AskAboutSourceInput = {
  sourceId: string;
  question: string;
};

export type AskAboutSourceResult = {
  answer: string;
  sourceId: string;
  model: string;
};

export type AnswerStreamHandle = {
  sourceId: string;
  model: string;
  tokens: AsyncIterable<string>;
};

function buildChatMessages(source: KnowledgeSource, question: string): LlmMessage[] {
  return [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    {
      role: 'user',
      content:
        `Document title: ${source.title}\n\n` +
        `Document text:\n${source.extractedText}\n\n` +
        `Question: ${question}`,
    },
  ];
}

async function loadIndexedSource(sourceId: string): Promise<KnowledgeSource> {
  const source = await knowledgeSourcesRepository.findById(sourceId);

  if (!source) {
    throw new AppError('SOURCE_NOT_FOUND', 'Knowledge source not found', 404);
  }

  if (source.status !== 'indexed' || !source.extractedText?.trim()) {
    throw new AppError(
      'SOURCE_NOT_READY',
      'Document text is not ready for chat yet. Wait until indexing completes.',
      409,
    );
  }

  return source;
}

export const chatService = {
  async askAboutSource(input: AskAboutSourceInput): Promise<AskAboutSourceResult> {
    const source = await loadIndexedSource(input.sourceId);
    const llm = getLlmClient();
    const result = await llm.chat(buildChatMessages(source, input.question));

    return {
      answer: result.content,
      sourceId: source.id,
      model: result.model,
    };
  },

  async createAnswerStream(input: AskAboutSourceInput): Promise<AnswerStreamHandle> {
    const source = await loadIndexedSource(input.sourceId);
    const llm = getLlmClient();

    return {
      sourceId: source.id,
      model: llm.getModelId(),
      tokens: llm.stream(buildChatMessages(source, input.question)),
    };
  },
};
