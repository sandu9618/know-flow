import { Worker } from 'bullmq';
import { config } from '../config.js';
import {
  INGEST_SOURCE_JOB_NAME,
  INGESTION_QUEUE_NAME,
} from '../constants/documents.constants.js';
import type { IngestSourceJobPayload } from '../clients/ingestion-queue.client.js';
import { bucketClient } from '../clients/bucket.client.js';
import { knowledgeSourcesRepository } from '../repositories/knowledge-sources.repository.js';
import { extractTextFromBuffer } from '../services/ingestion/extract-text.js';

let ingestionWorker: Worker<IngestSourceJobPayload> | null = null;

export function startIngestionWorker(): Worker<IngestSourceJobPayload> {
  if (ingestionWorker) {
    return ingestionWorker;
  }

  ingestionWorker = new Worker<IngestSourceJobPayload>(
    INGESTION_QUEUE_NAME,
    async (job) => {
      if (job.name !== INGEST_SOURCE_JOB_NAME) {
        return;
      }

      const { sourceId } = job.data;
      const source = await knowledgeSourcesRepository.findById(sourceId);

      if (!source) {
        console.warn(`[ingestion] source not found: ${sourceId}`);
        return;
      }

      console.log(
        `[ingestion] extracting text for "${source.title}" (${sourceId})`,
      );

      await knowledgeSourcesRepository.updateStatus(sourceId, 'indexing');

      try {
        const body = await bucketClient.downloadObject(source.sourceConfig.bucketKey);
        const extractedText = await extractTextFromBuffer(
          body,
          source.sourceConfig.mimeType,
        );
        await knowledgeSourcesRepository.markIndexedWithText(sourceId, extractedText);
        console.log(`[ingestion] indexed "${source.title}" (${sourceId})`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        await knowledgeSourcesRepository.updateStatus(sourceId, 'failed', message);
        console.error(`[ingestion] failed for ${sourceId}: ${message}`);
        throw error;
      }
    },
    {
      connection: { url: config.redisUrl },
      concurrency: 1,
    },
  );

  ingestionWorker.on('failed', (job, error) => {
    console.error(`[ingestion] job ${job?.id} failed:`, error);
  });

  return ingestionWorker;
}

export async function stopIngestionWorker(): Promise<void> {
  if (!ingestionWorker) {
    return;
  }

  await ingestionWorker.close();
  ingestionWorker = null;
}
