import { MAX_UPLOAD_BYTES } from '@knowflow/constants';

export { MAX_UPLOAD_BYTES };

export const ALLOWED_UPLOAD_MIME_TYPES = ['application/pdf', 'text/plain'] as const;

export type AllowedUploadMimeType = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number];

export const INGESTION_QUEUE_NAME = 'ingestion';

export const INGEST_SOURCE_JOB_NAME = 'ingest-source';
