import type { KnowledgeSourceType } from '../../types/knowledge-source.types.js';

export type SourceAdapter = {
  sourceType: KnowledgeSourceType;
  displayName: string;
  implemented: boolean;
};

export const sourceAdapters: SourceAdapter[] = [
  { sourceType: 'file_upload', displayName: 'File Upload', implemented: true },
  { sourceType: 'jira', displayName: 'Jira', implemented: false },
  { sourceType: 'github', displayName: 'GitHub', implemented: false },
  { sourceType: 'confluence', displayName: 'Confluence', implemented: false },
  { sourceType: 'incident_report', displayName: 'Incident Report', implemented: false },
];

export function getAdapter(sourceType: KnowledgeSourceType): SourceAdapter | undefined {
  return sourceAdapters.find((adapter) => adapter.sourceType === sourceType);
}
