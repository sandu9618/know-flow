import { Worker } from 'bullmq';
import { config } from '../config.js';
import {
  INGEST_SOURCE_JOB_NAME,
  INGESTION_QUEUE_NAME,
} from '../constants/documents.constants.js';
import type { IngestSourceJobPayload } from '../clients/ingestion-queue.client.js';
import { ingestSource } from '../services/ingestion/ingest-source.service.js';

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
      console.log(`[ingestion] processing source ${sourceId}`);

      try {
        await ingestSource(sourceId);
        console.log(`[ingestion] completed source ${sourceId}`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
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
