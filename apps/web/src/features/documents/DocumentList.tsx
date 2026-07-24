import { ApiError } from '@/lib/api';
import { useDocuments } from '@/features/documents/useDocuments';
import { getSourceMetaFields } from '@/features/documents/sourceMeta';
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

function formatSourceType(sourceType: string): string {
  return sourceType.replace(/_/g, ' ');
}

export default function DocumentList() {
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
          No knowledge sources yet — upload a PDF or TXT file to get started.
        </p>
      )}

      {!isLoading && !error && documents.length > 0 && (
        <ul className={styles.sourceList}>
          {documents.map((document) => {
            const metaFields = getSourceMetaFields(document, {
              formatFileSize,
              formatDate,
              formatSourceType,
            });

            return (
              <li key={document.id} className={styles.sourceItem}>
                <div className={styles.sourceHeader}>
                  <p className={styles.sourceTitle}>{document.title}</p>
                  <span className={`${styles.statusBadge} ${styles[`status_${document.status}`]}`}>
                    {formatStatus(document.status)}
                  </span>
                </div>
                <dl className={styles.sourceMeta}>
                  {metaFields.map((field) => (
                    <div key={field.label}>
                      <dt>{field.label}</dt>
                      <dd>{field.value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
