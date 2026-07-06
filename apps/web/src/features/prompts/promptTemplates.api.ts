import type { PromptPattern } from '@knowflow/prompts';
import { ApiError, fetchJson, getApiBaseUrl } from '@/lib/api';
import type {
  CreatePromptTemplateRequest,
  PromptTemplate,
  UpdatePromptTemplateRequest,
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

export async function updatePromptTemplate(
  id: string,
  input: UpdatePromptTemplateRequest,
): Promise<PromptTemplate> {
  const response = await fetchJson<{ data: PromptTemplate }>(
    `/api/prompt-templates/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function deletePromptTemplate(id: string): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/prompt-templates/${encodeURIComponent(id)}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

  if (response.ok) {
    return;
  }

  const body = (await response.json()) as {
    error?: { code?: string; message?: string };
  };

  throw new ApiError(
    body.error?.message ?? `Request failed with status ${response.status}`,
    response.status,
    body.error?.code,
  );
}
