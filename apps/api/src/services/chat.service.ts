import { getLlmClient } from '../clients/llm.client.js';
import type { LlmMessage } from '../clients/llm/types.js';
import { LIBRARY_CONVERSATION_KEY } from '../constants/rag.constants.js';
import { AppError } from '../errors/AppError.js';
import { toCitationDto } from '../mappers/citation.mapper.js';
import { conversationsRepository } from '../repositories/conversations.repository.js';
import { knowledgeSourcesRepository } from '../repositories/knowledge-sources.repository.js';
import {
  retrieveTopChunks,
  type RetrievedChunk,
} from '../services/rag/retrieve-chunks.service.js';
import type { CitationDto } from '../types/citation.types.js';
import type { ConversationMessage } from '../types/conversation.types.js';
import type { KnowledgeSource } from '../types/knowledge-source.types.js';

const SYSTEM_INSTRUCTION =
  'You are a helpful assistant that answers questions using only the provided excerpts. ' +
  'If the answer is not in the excerpts, say you do not know based on the provided material. ' +
  'Do not invent facts that are not supported by the excerpt text.';

export type ChatScope = 'source' | 'library';

export type AskChatInput = {
  question: string;
  scope: ChatScope;
  sourceId?: string;
};

export type AskAboutSourceResult = {
  answer: string;
  sourceId: string;
  model: string;
  conversationId: string;
  citations: CitationDto[];
};

export type AnswerStreamHandle = {
  conversationId: string;
  sourceId: string;
  model: string;
  citations: CitationDto[];
  tokens: AsyncIterable<string>;
};

export type PersistTurnInput = {
  conversationId: string;
  question: string;
  answer: string;
  citations: string[];
};

type ChatContext = {
  conversationSourceId: string;
  retrievalSourceIds: string[];
  sourceTitles: Record<string, string>;
};

function buildExcerptContext(retrievedChunks: RetrievedChunk[]): string {
  if (retrievedChunks.length === 0) {
    return 'No excerpts were retrieved.';
  }

  return retrievedChunks
    .map(
      (chunk) => `[${chunk.sourceTitle} — chunk ${chunk.index}]\n${chunk.text}`,
    )
    .join('\n\n---\n\n');
}

function buildChatMessages(
  retrievedChunks: RetrievedChunk[],
  priorMessages: ConversationMessage[],
  question: string,
): LlmMessage[] {
  const systemContent =
    `${SYSTEM_INSTRUCTION}\n\n` +
    `Relevant excerpts:\n${buildExcerptContext(retrievedChunks)}`;

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

function toCitations(retrievedChunks: RetrievedChunk[]): CitationDto[] {
  return retrievedChunks.map((chunk) => toCitationDto(chunk, chunk.sourceTitle));
}

async function loadIndexedSource(sourceId: string): Promise<KnowledgeSource> {
  const source = await knowledgeSourcesRepository.findById(sourceId);

  if (!source) {
    throw new AppError('SOURCE_NOT_FOUND', 'Knowledge source not found', 404);
  }

  if (source.status !== 'indexed' || !source.chunkCount || source.chunkCount <= 0) {
    throw new AppError(
      'SOURCE_NOT_READY',
      'Document text is not ready for chat yet. Wait until indexing completes.',
      409,
    );
  }

  return source;
}

async function resolveChatContext(input: AskChatInput): Promise<ChatContext> {
  if (input.scope === 'library') {
    const indexedSources = await knowledgeSourcesRepository.findIndexedWithChunks();

    if (indexedSources.length === 0) {
      throw new AppError(
        'SOURCE_NOT_READY',
        'No indexed documents are ready for chat yet. Upload and wait for indexing to complete.',
        409,
      );
    }

    return {
      conversationSourceId: LIBRARY_CONVERSATION_KEY,
      retrievalSourceIds: indexedSources.map((source) => source.id),
      sourceTitles: Object.fromEntries(
        indexedSources.map((source) => [source.id, source.title]),
      ),
    };
  }

  if (!input.sourceId) {
    throw new AppError('SOURCE_NOT_FOUND', 'Knowledge source not found', 404);
  }

  const source = await loadIndexedSource(input.sourceId);

  return {
    conversationSourceId: source.id,
    retrievalSourceIds: [source.id],
    sourceTitles: {
      [source.id]: source.title,
    },
  };
}

async function prepareChatTurn(input: AskChatInput): Promise<{
  conversationSourceId: string;
  conversationId: string;
  messages: LlmMessage[];
  citations: CitationDto[];
  citationIds: string[];
}> {
  const context = await resolveChatContext(input);
  const conversation = await conversationsRepository.findOrCreateBySourceId(
    context.conversationSourceId,
  );
  const retrievedChunks = await retrieveTopChunks({
    question: input.question,
    sourceIds: context.retrievalSourceIds,
    sourceTitles: context.sourceTitles,
  });
  const citations = toCitations(retrievedChunks);
  const messages = buildChatMessages(
    retrievedChunks,
    conversation.messages,
    input.question,
  );

  return {
    conversationSourceId: context.conversationSourceId,
    conversationId: conversation.id,
    messages,
    citations,
    citationIds: citations.map((citation) => citation.chunkId),
  };
}

export const chatService = {
  async askAboutSource(input: AskChatInput): Promise<AskAboutSourceResult> {
    const prepared = await prepareChatTurn(input);
    const llm = getLlmClient();
    const result = await llm.chat(prepared.messages);

    await this.persistTurn({
      conversationId: prepared.conversationId,
      question: input.question,
      answer: result.content,
      citations: prepared.citationIds,
    });

    return {
      answer: result.content,
      sourceId: prepared.conversationSourceId,
      model: result.model,
      conversationId: prepared.conversationId,
      citations: prepared.citations,
    };
  },

  async createAnswerStream(input: AskChatInput): Promise<AnswerStreamHandle> {
    const prepared = await prepareChatTurn(input);
    const llm = getLlmClient();

    return {
      conversationId: prepared.conversationId,
      sourceId: prepared.conversationSourceId,
      model: llm.getModelId(),
      citations: prepared.citations,
      tokens: llm.stream(prepared.messages),
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
        citations: input.citations,
        timestamp: now,
      },
    ]);

    if (!updated) {
      throw new AppError('CONVERSATION_NOT_FOUND', 'Conversation not found', 404);
    }
  },
};
