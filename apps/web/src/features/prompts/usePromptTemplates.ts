import { useQuery } from '@tanstack/react-query';
import { listPromptTemplates } from '@/features/prompts/promptTemplates.api';
import type { PromptTemplate } from '@/types/prompt-template.types';

export const promptTemplatesQueryKey = ['prompt-templates'] as const;

export function usePromptTemplates() {
  return useQuery<PromptTemplate[], Error>({
    queryKey: promptTemplatesQueryKey,
    queryFn: () => listPromptTemplates(),
  });
}
