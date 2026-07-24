import type { KnowledgeSourceListItem } from '@/types/knowledge-source.types';
import styles from '@/features/chat/ChatPage.module.css';

type SourcePickerProps = {
  sources: KnowledgeSourceListItem[];
  selectedId: string;
  onSelect: (sourceId: string) => void;
  isLoading: boolean;
  error: Error | null;
};

export default function SourcePicker({
  sources,
  selectedId,
  onSelect,
  isLoading,
  error,
}: SourcePickerProps) {
  const indexedSources = sources.filter((source) => source.status === 'indexed');

  if (isLoading) {
    return <p className={styles.status}>Loading documents…</p>;
  }

  if (error) {
    return <p className={styles.error}>Could not load documents: {error.message}</p>;
  }

  if (indexedSources.length === 0) {
    return (
      <p className={styles.empty}>
        No indexed documents yet. Upload a PDF or TXT on the Documents page and wait
        until its status is Indexed.
      </p>
    );
  }

  return (
    <div className={styles.sourcePicker}>
      <label className={styles.composerLabel} htmlFor="chat-source">
        Document
      </label>
      <select
        id="chat-source"
        className={styles.sourceSelect}
        value={selectedId}
        onChange={(event) => onSelect(event.target.value)}
      >
        <option value="">Select a document…</option>
        {indexedSources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.title}
          </option>
        ))}
      </select>
    </div>
  );
}
