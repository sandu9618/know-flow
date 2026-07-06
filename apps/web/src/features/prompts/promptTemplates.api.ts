import type { PromptPattern } from '@knowflow/prompts';
import { fetchJson } from '@/lib/api';
import type {
  CreatePromptTemplateRequest,
  PromptTemplate,
} from '@/types/prompt-template.types';

export async function listPromptTemplates(
  pattern?: PromptPattern,
): Promise<PromptTemplate[]> {
  const query = pattern ? `?pattern=${encodeURIComponent(pattern)}` : '';
  const response = await fetchJson<{ data: PromptTemplate[] }>(
    `/api/prompt-templates${query}`,
  );
  return response.data;
}

export async function createPromptTemplate(
  input: CreatePromptTemplateRequest,
): Promise<PromptTemplate> {
  const response = await fetchJson<{ data: PromptTemplate }>('/api/prompt-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return response.data;
}
