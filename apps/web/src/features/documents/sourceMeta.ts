import type {
  FileUploadSourceConfigListItem,
  KnowledgeSourceListItem,
} from '@/types/knowledge-source.types';

export type SourceMetaField = {
  label: string;
  value: string;
};

function isFileUploadConfig(
  sourceConfig: KnowledgeSourceListItem['sourceConfig'],
): sourceConfig is FileUploadSourceConfigListItem {
  return (
    typeof sourceConfig === 'object' &&
    sourceConfig !== null &&
    'filename' in sourceConfig &&
    'sizeBytes' in sourceConfig
  );
}

export function getSourceMetaFields(
  source: KnowledgeSourceListItem,
  formatters: {
    formatFileSize: (bytes: number) => string;
    formatDate: (value: string | null) => string;
    formatSourceType: (sourceType: KnowledgeSourceListItem['sourceType']) => string;
  },
): SourceMetaField[] {
  const fields: SourceMetaField[] = [
    {
      label: 'Type',
      value: formatters.formatSourceType(source.sourceType),
    },
  ];

  if (source.sourceType === 'file_upload' && isFileUploadConfig(source.sourceConfig)) {
    fields.push(
      { label: 'Filename', value: source.sourceConfig.filename },
      { label: 'Size', value: formatters.formatFileSize(source.sourceConfig.sizeBytes) },
    );
  } else {
    fields.push({ label: 'Source', value: source.title });
  }

  fields.push({
    label: 'Acquired',
    value: formatters.formatDate(source.acquiredAt),
  });

  return fields;
}
