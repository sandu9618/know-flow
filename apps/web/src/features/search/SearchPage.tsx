import SearchForm from '@/features/search/SearchForm';
import SearchResultList from '@/features/search/SearchResultList';
import { useSearch } from '@/features/search/useSearch';
import { getNavItemByPath } from '@/routes/navConfig';
import styles from '@/features/search/SearchPage.module.css';

const navItem = getNavItemByPath('/search')!;

export default function SearchPage() {
  const {
    draft,
    setDraft,
    submitSearch,
    results,
    isLoading,
    errorMessage,
    hasSubmitted,
  } = useSearch();

  return (
    <article className={styles.page}>
      <p className={styles.pageBadge}>{navItem.weekLabel}</p>
      <h1>{navItem.label}</h1>
      <p className={styles.pageDescription}>{navItem.description}</p>

      <SearchForm
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={submitSearch}
        isLoading={isLoading}
      />

      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {!hasSubmitted ? (
        <p className={styles.empty}>Enter a query to search indexed documents.</p>
      ) : null}

      {hasSubmitted && isLoading ? <p className={styles.status}>Searching…</p> : null}

      {hasSubmitted && !isLoading && !errorMessage && results.length === 0 ? (
        <p className={styles.empty}>No matching passages in your indexed documents.</p>
      ) : null}

      {hasSubmitted && !isLoading && !errorMessage && results.length > 0 ? (
        <SearchResultList results={results} />
      ) : null}
    </article>
  );
}
