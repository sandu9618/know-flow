import { afterEach, describe, expect, it, vi } from 'vitest';

const { close, on, Worker } = vi.hoisted(() => {
  const closeFn = vi.fn().mockResolvedValue(undefined);
  const onFn = vi.fn();
  const WorkerFn = vi.fn().mockImplementation(() => ({ on: onFn, close: closeFn }));
  return { close: closeFn, on: onFn, Worker: WorkerFn };
});

vi.mock('bullmq', () => ({
  Worker,
}));

vi.mock('../services/ingestion/ingest-source.service.js', () => ({
  ingestSource: vi.fn(),
}));

import {
  INGEST_SOURCE_JOB_NAME,
  INGESTION_QUEUE_NAME,
  INGESTION_WORKER_CONCURRENCY,
} from '../constants/documents.constants.js';
import type { IngestSourceJobPayload } from '../clients/ingestion-queue.client.js';
import { startIngestionWorker, stopIngestionWorker } from './ingestion.worker.js';

describe('ingestion worker', () => {
  afterEach(async () => {
    await stopIngestionWorker();
    Worker.mockClear();
    on.mockClear();
    close.mockClear();
  });

  it('starts with concurrency of one source at a time', async () => {
    startIngestionWorker();

    expect(INGESTION_WORKER_CONCURRENCY).toBe(1);
    expect(Worker).toHaveBeenCalledWith(
      INGESTION_QUEUE_NAME,
      expect.any(Function),
      expect.objectContaining({
        concurrency: INGESTION_WORKER_CONCURRENCY,
      }),
    );
  });

  it('uses ingest-source jobs whose payload is sourceId only', () => {
    expect(INGEST_SOURCE_JOB_NAME).toBe('ingest-source');

    const payload: IngestSourceJobPayload = { sourceId: '6a61e973d923b6f0e248762a' };
    expect(payload).toEqual({ sourceId: '6a61e973d923b6f0e248762a' });
  });
});
