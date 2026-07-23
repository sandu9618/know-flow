import { Queue } from 'bullmq';
import { config } from '../config.js';
import {
  INGEST_SOURCE_JOB_NAME,
  INGESTION_QUEUE_NAME,
} from '../constants/documents.constants.js';

export type IngestSourceJobPayload = {
  sourceId: string;
};

let ingestionQueue: Queue<IngestSourceJobPayload> | null = null;

function getIngestionQueue(): Queue<IngestSourceJobPayload> {
  if (!ingestionQueue) {
    ingestionQueue = new Queue<IngestSourceJobPayload>(INGESTION_QUEUE_NAME, {
      connection: { url: config.redisUrl },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 100,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    });
  }

  return ingestionQueue;
}

export const ingestionQueueClient = {
  async enqueueIngestSource(sourceId: string): Promise<void> {
    await getIngestionQueue().add(INGEST_SOURCE_JOB_NAME, { sourceId });
  },
};
