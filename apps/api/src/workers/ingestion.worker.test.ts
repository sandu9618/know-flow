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
import { ingestSource } from '../services/ingestion/ingest-source.service.js';
import { startIngestionWorker, stopIngestionWorker } from './ingestion.worker.js';

type IngestJob = {
  name: string;
  data: IngestSourceJobPayload;
};

type IngestProcessor = (job: IngestJob) => Promise<void>;

function startAndGetProcessor(): IngestProcessor {
  startIngestionWorker();
  const processor = Worker.mock.calls[0]?.[1] as IngestProcessor | undefined;
  if (!processor) {
    throw new Error('ingestion worker did not register a processor');
  }
  return processor;
}

describe('ingestion worker', () => {
  afterEach(async () => {
    await stopIngestionWorker();
    Worker.mockClear();
    on.mockClear();
    close.mockClear();
    vi.mocked(ingestSource).mockReset();
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

  it('ignores jobs that are not ingest-source', async () => {
    const processor = startAndGetProcessor();

    await processor({
      name: 'other-job',
      data: { sourceId: '6a61e973d923b6f0e248762a' },
    });

    expect(ingestSource).not.toHaveBeenCalled();
  });

  it('resolves the job only after ingestSource finishes', async () => {
    let releaseIngest: () => void = () => undefined;
    const ingestGate = new Promise<void>((resolve) => {
      releaseIngest = resolve;
    });
    vi.mocked(ingestSource).mockReturnValue(ingestGate);

    const processor = startAndGetProcessor();
    const sourceId = '6a61e973d923b6f0e248762a';
    let settled = false;
    const pending = processor({
      name: INGEST_SOURCE_JOB_NAME,
      data: { sourceId },
    }).then(() => {
      settled = true;
    });

    expect(ingestSource).toHaveBeenCalledTimes(1);
    expect(ingestSource).toHaveBeenCalledWith(sourceId);
    expect(settled).toBe(false);

    releaseIngest();
    await pending;
    expect(settled).toBe(true);
  });

  it('rejects the job when ingestSource fails', async () => {
    vi.mocked(ingestSource).mockRejectedValue(new Error('extract failed'));
    const processor = startAndGetProcessor();

    await expect(
      processor({
        name: INGEST_SOURCE_JOB_NAME,
        data: { sourceId: '6a61e973d923b6f0e248762a' },
      }),
    ).rejects.toThrow('extract failed');
  });
});
