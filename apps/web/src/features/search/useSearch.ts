import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchDocuments } from '@/features/search/search.api';
import { ApiError } from '@/lib/api';

export function useSearch() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const submittedQuery = searchParams.get('q')?.trim() ?? '';
  const [draft, setDraft] = useState(submittedQuery);

  useEffect(() => {
    setDraft(submittedQuery);
  }, [submittedQuery]);

  const resultsQuery = useQuery({
    queryKey: ['search', submittedQuery],
    queryFn: () => searchDocuments(submittedQuery),
    enabled: submittedQuery.length > 0,
  });

  function submitSearch() {
    const nextQuery = draft.trim();
    if (!nextQuery) {
      return;
    }

    if (nextQuery === submittedQuery) {
      void queryClient.invalidateQueries({ queryKey: ['search', nextQuery] });
      return;
    }

    setSearchParams({ q: nextQuery });
  }

  const errorMessage = resultsQuery.error
    ? resultsQuery.error instanceof ApiError
      ? resultsQuery.error.message
      : 'Search failed'
    : null;

  return {
    draft,
    setDraft,
    submitSearch,
    submittedQuery,
    results: resultsQuery.data ?? [],
    isLoading: resultsQuery.isFetching,
    errorMessage,
    hasSubmitted: submittedQuery.length > 0,
  };
}
