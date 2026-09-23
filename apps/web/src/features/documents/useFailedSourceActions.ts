import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDocument, reingestDocument } from '@/features/documents/documents.api';
import { documentsQueryKey } from '@/features/documents/useDocuments';
import { ApiError } from '@/lib/api';

export function useFailedSourceActions() {
  const queryClient = useQueryClient();

  const reingest = useMutation({
    mutationFn: (id: string) => reingestDocument(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    },
  });

  function isBusy(id: string): boolean {
    return (
      (reingest.isPending && reingest.variables === id) ||
      (remove.isPending && remove.variables === id)
    );
  }

  function actionError(id: string): string | null {
    if (reingest.isError && reingest.variables === id) {
      return reingest.error instanceof ApiError
        ? reingest.error.message
        : 'Could not retry indexing.';
    }

    if (remove.isError && remove.variables === id) {
      return remove.error instanceof ApiError
        ? remove.error.message
        : 'Could not remove this source.';
    }

    return null;
  }

  return {
    retryIndexing: reingest.mutate,
    removeSource: remove.mutate,
    isBusy,
    actionError,
  };
}
