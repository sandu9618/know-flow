import type { KnowledgeSource, KnowledgeSourceType } from '../../types/knowledge-source.types.js';
import { resolveFileUploadText } from './file-upload.adapter.js';

export type SourceAdapter = {
  sourceType: KnowledgeSourceType;
  displayName: string;
  implemented: boolean;
  resolveText?: (source: KnowledgeSource) => Promise<string>;
};

export type ContentAdapter = SourceAdapter & {
  implemented: true;
  resolveText: (source: KnowledgeSource) => Promise<string>;
};

export const sourceAdapters: SourceAdapter[] = [
  {
    sourceType: 'file_upload',
    displayName: 'File Upload',
    implemented: true,
    resolveText: resolveFileUploadText,
  },
  { sourceType: 'jira', displayName: 'Jira', implemented: false },
  { sourceType: 'github', displayName: 'GitHub', implemented: false },
  { sourceType: 'confluence', displayName: 'Confluence', implemented: false },
  { sourceType: 'incident_report', displayName: 'Incident Report', implemented: false },
];

export function getAdapter(sourceType: KnowledgeSourceType): SourceAdapter | undefined {
  return sourceAdapters.find((adapter) => adapter.sourceType === sourceType);
}

export function getContentAdapter(sourceType: KnowledgeSourceType): ContentAdapter {
  const adapter = getAdapter(sourceType);

  if (!adapter?.implemented || !adapter.resolveText) {
    throw new Error(`No ingest adapter for source type: ${sourceType}`);
  }

  return adapter as ContentAdapter;
}
