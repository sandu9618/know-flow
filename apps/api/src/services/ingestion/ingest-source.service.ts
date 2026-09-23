import { chunksRepository } from '../../repositories/chunks.repository.js';
import { knowledgeSourcesRepository } from '../../repositories/knowledge-sources.repository.js';
import { getContentAdapter } from '../acquisition/adapters.js';
import { chunkText } from './chunk-text.js';

const KNOWN_INGEST_ERROR_MESSAGES = new Set([
  'TXT file is empty',
  'PDF contained no extractable text',
  'No text content available to index',
]);

const GENERIC_INGEST_ERROR_MESSAGE =
  'Could not read this file. Retry indexing, or upload a corrected PDF or TXT file.';

const MAX_INGEST_ERROR_MESSAGE_LENGTH = 200;

export type IngestSourceOptions = {
  isFinalAttempt?: boolean;
};

function toStoredIngestErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const firstLine = raw.split('\n')[0]?.trim() ?? '';

  if (KNOWN_INGEST_ERROR_MESSAGES.has(firstLine)) {
    return firstLine.slice(0, MAX_INGEST_ERROR_MESSAGE_LENGTH);
  }

  return GENERIC_INGEST_ERROR_MESSAGE;
}

export async function ingestSource(
  sourceId: string,
  options: IngestSourceOptions = {},
): Promise<void> {
  const isFinalAttempt = options.isFinalAttempt ?? true;
  const source = await knowledgeSourcesRepository.findById(sourceId);

  if (!source) {
    return;
  }

  await knowledgeSourcesRepository.updateStatus(sourceId, 'indexing');

  try {
    const adapter = getContentAdapter(source.sourceType);
    const extractedText = await adapter.resolveText(source);
    const chunks = chunkText(extractedText);

    if (chunks.length === 0) {
      throw new Error('No text content available to index');
    }

    await chunksRepository.replaceForSource(sourceId, chunks);
    await knowledgeSourcesRepository.markIndexed(sourceId, {
      chunkCount: chunks.length,
    });
  } catch (error: unknown) {
    if (isFinalAttempt) {
      await knowledgeSourcesRepository.updateStatus(
        sourceId,
        'failed',
        toStoredIngestErrorMessage(error),
      );
      await chunksRepository.deleteBySourceId(sourceId);
    }

    throw error;
  }
}
