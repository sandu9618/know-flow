import { useQuery } from '@tanstack/react-query';
import { listDocuments } from '@/features/documents/documents.api';
import type { KnowledgeSourceListItem } from '@/types/knowledge-source.types';

export const documentsQueryKey = ['documents'] as const;

export function useDocuments() {
  return useQuery<KnowledgeSourceListItem[], Error>({
    queryKey: documentsQueryKey,
    queryFn: () => listDocuments(),
  });
}
