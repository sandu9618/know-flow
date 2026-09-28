import { fetchJson } from '@/lib/api';
import type { SearchResult } from '@/types/search.types';

export async function searchDocuments(query: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({ q: query });
  const response = await fetchJson<{ data: SearchResult[] }>(`/api/search?${params.toString()}`);
  return response.data;
}
