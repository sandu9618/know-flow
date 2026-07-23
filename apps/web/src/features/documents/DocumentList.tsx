import { ApiError } from '@/lib/api';
import { useDocuments } from '@/features/documents/useDocuments';
import type { KnowledgeSourceStatus } from '@/types/knowledge-source.types';
import styles from '@/features/documents/DocumentsPage.module.css';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString();
}

function formatStatus(status: KnowledgeSourceStatus): string {
  return status.replace(/_/g, ' ');
}

interface DocumentListProps {
  hasUploadedRecently?: boolean;
}

export default function DocumentList({ hasUploadedRecently = false }: DocumentListProps) {
  const { data: documents = [], isLoading, error } = useDocuments();

  return (
    <section className={styles.listSection} aria-labelledby="document-list-heading">
      <h2 id="document-list-heading">Knowledge sources</h2>

      {isLoading && (
        <p className={styles.status} role="status">
          Loading sources…
        </p>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error instanceof ApiError
            ? error.message
            : 'Something went wrong while loading knowledge sources.'}
        </p>
      )}

      {!isLoading && !error && documents.length === 0 && (
        <p className={styles.empty} role="status">
          {hasUploadedRecently
            ? 'Refreshing the list…'
            : 'No knowledge sources yet — upload a PDF or TXT file to get started.'}
        </p>
      )}

      {!isLoading && !error && documents.length > 0 && (
        <ul className={styles.sourceList}>
          {documents.map((document) => (
            <li key={document.id} className={styles.sourceItem}>
              <div className={styles.sourceHeader}>
                <p className={styles.sourceTitle}>{document.title}</p>
                <span className={`${styles.statusBadge} ${styles[`status_${document.status}`]}`}>
                  {formatStatus(document.status)}
                </span>
              </div>
              <dl className={styles.sourceMeta}>
                <div>
                  <dt>Type</dt>
                  <dd>{document.sourceType.replace(/_/g, ' ')}</dd>
                </div>
                <div>
                  <dt>Filename</dt>
                  <dd>{document.sourceConfig.filename}</dd>
                </div>
                <div>
                  <dt>Size</dt>
                  <dd>{formatFileSize(document.sourceConfig.sizeBytes)}</dd>
                </div>
                <div>
                  <dt>Acquired</dt>
                  <dd>{formatDate(document.acquiredAt)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
