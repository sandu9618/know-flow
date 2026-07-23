export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export const ALLOWED_UPLOAD_MIME_TYPES = ['application/pdf', 'text/plain'] as const;

export type AllowedUploadMimeType = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number];

export const INGESTION_QUEUE_NAME = 'ingestion';

export const INGEST_SOURCE_JOB_NAME = 'ingest-source';
