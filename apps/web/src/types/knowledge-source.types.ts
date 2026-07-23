export type KnowledgeSourceType =
  | 'file_upload'
  | 'jira'
  | 'github'
  | 'confluence'
  | 'incident_report';

export type KnowledgeSourceStatus =
  | 'acquired'
  | 'pending_ingestion'
  | 'indexing'
  | 'indexed'
  | 'failed';

export type FileUploadSourceConfig = {
  filename: string;
  bucketKey: string;
  mimeType: string;
  sizeBytes: number;
};

export type KnowledgeSource = {
  id: string;
  sourceType: KnowledgeSourceType;
  title: string;
  status: KnowledgeSourceStatus;
  sourceConfig: FileUploadSourceConfig;
  errorMessage: string | null;
  chunkCount: number | null;
  createdAt: string;
  acquiredAt: string | null;
  indexedAt: string | null;
};

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export const ACCEPTED_UPLOAD_TYPES = '.pdf,.txt,application/pdf,text/plain';
