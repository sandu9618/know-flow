import type { SearchResult } from '@/types/search.types';
import styles from '@/features/search/SearchPage.module.css';

type SearchResultListProps = {
  results: SearchResult[];
};

export default function SearchResultList({ results }: SearchResultListProps) {
  return (
    <ol className={styles.resultList}>
      {results.map((result) => (
        <li key={result.chunkId}>
          <article className={styles.resultItem}>
            <div className={styles.resultHeader}>
              <h2 className={styles.resultTitle}>{result.sourceTitle}</h2>
              <p className={styles.resultScore}>Relevance {result.score.toFixed(2)}</p>
            </div>
            <p className={styles.snippet}>{result.snippet}</p>
          </article>
        </li>
      ))}
    </ol>
  );
}
