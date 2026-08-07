import { bucketClient } from '../../clients/bucket.client.js';
import { chunksRepository } from '../../repositories/chunks.repository.js';
import { knowledgeSourcesRepository } from '../../repositories/knowledge-sources.repository.js';
import { chunkText } from './chunk-text.js';
import { extractTextFromBuffer } from './extract-text.js';

export async function ingestSource(sourceId: string): Promise<void> {
  const source = await knowledgeSourcesRepository.findById(sourceId);

  if (!source) {
    return;
  }

  await knowledgeSourcesRepository.updateStatus(sourceId, 'indexing');

  try {
    const body = await bucketClient.downloadObject(source.sourceConfig.bucketKey);
    const extractedText = await extractTextFromBuffer(
      body,
      source.sourceConfig.mimeType,
    );
    const chunks = chunkText(extractedText);

    if (chunks.length === 0) {
      throw new Error('No text content available to index');
    }

    await chunksRepository.replaceForSource(sourceId, chunks);
    await knowledgeSourcesRepository.markIndexed(sourceId, {
      extractedText,
      chunkCount: chunks.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    await knowledgeSourcesRepository.updateStatus(sourceId, 'failed', message);
    throw error;
  }
}
