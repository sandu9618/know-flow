import type { FormEvent } from 'react';
import styles from '@/features/search/SearchPage.module.css';

type SearchFormProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
};

export default function SearchForm({ draft, onDraftChange, onSubmit, isLoading }: SearchFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label} htmlFor="library-search">
        Search query
      </label>
      <input
        id="library-search"
        className={styles.input}
        type="search"
        value={draft}
        maxLength={500}
        placeholder="e.g. employee vacation rules"
        onChange={(event) => onDraftChange(event.target.value)}
      />
      <button type="submit" disabled={!draft.trim() || isLoading}>
        {isLoading ? 'Searching…' : 'Search'}
      </button>
    </form>
  );
}
