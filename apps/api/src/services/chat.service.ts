import { getLlmClient } from '../clients/llm.client.js';
import { AppError } from '../errors/AppError.js';
import { knowledgeSourcesRepository } from '../repositories/knowledge-sources.repository.js';

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

export const chatService = {
  async askAboutSource(input: AskAboutSourceInput): Promise<AskAboutSourceResult> {
    const source = await knowledgeSourcesRepository.findById(input.sourceId);

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

    const llm = getLlmClient();
    const result = await llm.chat([
      { role: 'system', content: SYSTEM_INSTRUCTION },
      {
        role: 'user',
        content:
          `Document title: ${source.title}\n\n` +
          `Document text:\n${source.extractedText}\n\n` +
          `Question: ${input.question}`,
      },
    ]);

    return {
      answer: result.content,
      sourceId: source.id,
      model: result.model,
    };
  },
};
