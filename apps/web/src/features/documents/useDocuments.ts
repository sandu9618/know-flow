import { useQuery } from '@tanstack/react-query';
import { listDocuments } from '@/features/documents/documents.api';
import type { KnowledgeSource } from '@/types/knowledge-source.types';

export const documentsQueryKey = ['documents'] as const;

export function useDocuments() {
  return useQuery<KnowledgeSource[], Error>({
    queryKey: documentsQueryKey,
    queryFn: () => listDocuments(),
  });
}
