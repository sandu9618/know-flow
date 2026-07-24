import type {
  FileUploadSourceConfig,
  KnowledgeSource,
  KnowledgeSourceListItem,
} from '../types/knowledge-source.types.js';

export function toKnowledgeSourceListItem(source: KnowledgeSource): KnowledgeSourceListItem {
  const { bucketKey: _bucketKey, ...sourceConfig } = source.sourceConfig as FileUploadSourceConfig;

  return {
    id: source.id,
    sourceType: source.sourceType,
    title: source.title,
    status: source.status,
    sourceConfig,
    errorMessage: source.errorMessage,
    chunkCount: source.chunkCount,
    createdAt: source.createdAt,
    acquiredAt: source.acquiredAt,
    indexedAt: source.indexedAt,
  };
}
