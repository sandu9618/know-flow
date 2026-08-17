import type { CitationDto } from '@/types/chat.types';
import styles from '@/features/chat/ChatPage.module.css';

type CitationListProps = {
  citations: CitationDto[];
};

export default function CitationList({ citations }: CitationListProps) {
  if (citations.length === 0) {
    return null;
  }

  return (
    <ul className={styles.citationList} aria-label="Sources">
      {citations.map((citation, index) => (
        <li key={`${citation.chunkId}-${index}`} className={styles.citationItem}>
          <details className={styles.citationDetails}>
            <summary className={styles.citationSummary}>
              {citation.sourceTitle} · chunk {citation.chunkIndex}
            </summary>
            <pre className={styles.citationSnippet}>{citation.text}</pre>
          </details>
        </li>
      ))}
    </ul>
  );
}
