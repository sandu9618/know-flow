import { ApiError, fetchJson, getApiBaseUrl } from '@/lib/api';
import type { KnowledgeSource } from '@/types/knowledge-source.types';

export async function listDocuments(): Promise<KnowledgeSource[]> {
  const response = await fetchJson<{ data: KnowledgeSource[] }>('/api/documents');
  return response.data;
}

export function uploadDocument(
  file: File,
  options?: {
    title?: string;
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
  },
): Promise<KnowledgeSource> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/documents`;
    const formData = new FormData();

    formData.append('file', file);
    if (options?.title?.trim()) {
      formData.append('title', options.title.trim());
    }

    xhr.open('POST', url);
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !options?.onProgress) {
        return;
      }

      const percent = Math.round((event.loaded / event.total) * 100);
      options.onProgress(percent);
    };

    xhr.onload = () => {
      let body: { data?: KnowledgeSource; error?: { code?: string; message?: string } } =
        {};

      try {
        body = JSON.parse(xhr.responseText) as typeof body;
      } catch {
        reject(new ApiError('Invalid response from server', xhr.status));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && body.data) {
        resolve(body.data);
        return;
      }

      reject(
        new ApiError(
          body.error?.message ?? `Request failed with status ${xhr.status}`,
          xhr.status,
          body.error?.code,
        ),
      );
    };

    xhr.onerror = () => {
      reject(new ApiError('Network error during upload', 0));
    };

    xhr.onabort = () => {
      reject(new ApiError('Upload cancelled', 0));
    };

    if (options?.signal) {
      if (options.signal.aborted) {
        xhr.abort();
        return;
      }

      options.signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }

    xhr.send(formData);
  });
}
