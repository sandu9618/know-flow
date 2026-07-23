import { Worker } from 'bullmq';
import { config } from '../config.js';
import {
  INGEST_SOURCE_JOB_NAME,
  INGESTION_QUEUE_NAME,
} from '../constants/documents.constants.js';
import type { IngestSourceJobPayload } from '../clients/ingestion-queue.client.js';
import { knowledgeSourcesRepository } from '../repositories/knowledge-sources.repository.js';

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
        `[ingestion] received ingest-source job for "${source.title}" (${sourceId})`,
      );

      // Week 3 (US-033) will stream from bucket, chunk, and update status here.
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
