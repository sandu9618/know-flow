import { getLlmClient } from '../clients/llm.client.js';
import type { LlmMessage } from '../clients/llm/types.js';
import { AppError } from '../errors/AppError.js';
import { conversationsRepository } from '../repositories/conversations.repository.js';
import { knowledgeSourcesRepository } from '../repositories/knowledge-sources.repository.js';
import type { ConversationMessage } from '../types/conversation.types.js';
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
  conversationId: string;
};

export type AnswerStreamHandle = {
  conversationId: string;
  sourceId: string;
  model: string;
  tokens: AsyncIterable<string>;
};

export type PersistTurnInput = {
  conversationId: string;
  question: string;
  answer: string;
};

function buildChatMessages(
  source: KnowledgeSource,
  priorMessages: ConversationMessage[],
  question: string,
): LlmMessage[] {
  const systemContent =
    `${SYSTEM_INSTRUCTION}\n\n` +
    `Document title: ${source.title}\n\n` +
    `Document text:\n${source.extractedText}`;

  const history: LlmMessage[] = priorMessages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  return [
    { role: 'system', content: systemContent },
    ...history,
    { role: 'user', content: question },
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
    const conversation = await conversationsRepository.findOrCreateBySourceId(source.id);
    const llm = getLlmClient();
    const result = await llm.chat(
      buildChatMessages(source, conversation.messages, input.question),
    );

    await this.persistTurn({
      conversationId: conversation.id,
      question: input.question,
      answer: result.content,
    });

    return {
      answer: result.content,
      sourceId: source.id,
      model: result.model,
      conversationId: conversation.id,
    };
  },

  async createAnswerStream(input: AskAboutSourceInput): Promise<AnswerStreamHandle> {
    const source = await loadIndexedSource(input.sourceId);
    const conversation = await conversationsRepository.findOrCreateBySourceId(source.id);
    const llm = getLlmClient();

    return {
      conversationId: conversation.id,
      sourceId: source.id,
      model: llm.getModelId(),
      tokens: llm.stream(
        buildChatMessages(source, conversation.messages, input.question),
      ),
    };
  },

  async persistTurn(input: PersistTurnInput): Promise<void> {
    const answer = input.answer.trim();
    if (!answer) {
      throw new AppError(
        'LLM_EMPTY_RESPONSE',
        'The AI service returned an empty answer. Please try again.',
        502,
      );
    }

    const now = new Date();
    const updated = await conversationsRepository.appendMessages(input.conversationId, [
      {
        role: 'user',
        content: input.question,
        timestamp: now,
      },
      {
        role: 'assistant',
        content: answer,
        citations: [],
        timestamp: now,
      },
    ]);

    if (!updated) {
      throw new AppError('CONVERSATION_NOT_FOUND', 'Conversation not found', 404);
    }
  },
};
