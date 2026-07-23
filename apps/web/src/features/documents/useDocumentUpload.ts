import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { uploadDocument } from '@/features/documents/documents.api';
import { documentsQueryKey } from '@/features/documents/useDocuments';
import { ApiError } from '@/lib/api';
import type { KnowledgeSource } from '@/types/knowledge-source.types';

export function useDocumentUpload() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (input: { file: File; title?: string }) =>
      uploadDocument(input.file, {
        title: input.title,
        onProgress: setProgress,
      }),
    onMutate: () => {
      setProgress(0);
    },
    onSuccess: () => {
      setProgress(100);
      void queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    },
    onError: () => {
      setProgress(0);
    },
  });

  return {
    upload: mutation.mutate,
    uploadAsync: mutation.mutateAsync,
    isUploading: mutation.isPending,
    progress,
    error: mutation.error,
    uploadedSource: mutation.data as KnowledgeSource | undefined,
    reset: mutation.reset,
  };
}

export function getUploadErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Something went wrong while uploading the file.';
}
