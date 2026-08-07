import { useQuery } from '@tanstack/react-query';
import { listDocuments } from '@/features/documents/documents.api';
import type {
  KnowledgeSourceListItem,
  KnowledgeSourceStatus,
} from '@/types/knowledge-source.types';

export const documentsQueryKey = ['documents'] as const;

const IN_FLIGHT_STATUSES: KnowledgeSourceStatus[] = ['acquired', 'indexing'];

const DOCUMENTS_POLL_INTERVAL_MS = 2000;

export function hasInFlightDocuments(
  documents: KnowledgeSourceListItem[] | undefined,
): boolean {
  return documents?.some((document) => IN_FLIGHT_STATUSES.includes(document.status)) ?? false;
}

export function getDocumentsRefetchInterval(
  documents: KnowledgeSourceListItem[] | undefined,
): number | false {
  return hasInFlightDocuments(documents) ? DOCUMENTS_POLL_INTERVAL_MS : false;
}

export function useDocuments() {
  return useQuery<KnowledgeSourceListItem[], Error>({
    queryKey: documentsQueryKey,
    queryFn: () => listDocuments(),
    refetchInterval: (query) => getDocumentsRefetchInterval(query.state.data),
  });
}
