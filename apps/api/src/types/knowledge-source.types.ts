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
  createdAt: Date;
  acquiredAt: Date | null;
  indexedAt: Date | null;
};

export type CreateFileUploadSourceInput = {
  id: string;
  title: string;
  sourceConfig: FileUploadSourceConfig;
};
