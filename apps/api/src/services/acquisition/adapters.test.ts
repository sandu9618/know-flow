import { describe, expect, it } from 'vitest';

import { getAdapter, getContentAdapter } from './adapters.js';

describe('getContentAdapter', () => {
  it('returns the file-upload adapter with resolveText', () => {
    const adapter = getContentAdapter('file_upload');

    expect(adapter.sourceType).toBe('file_upload');
    expect(adapter.implemented).toBe(true);
    expect(adapter.resolveText).toEqual(expect.any(Function));
  });

  it('throws for unimplemented connector source types', () => {
    expect(() => getContentAdapter('jira')).toThrow(
      'No ingest adapter for source type: jira',
    );
    expect(getAdapter('jira')?.implemented).toBe(false);
    expect(getAdapter('jira')?.resolveText).toBeUndefined();
  });
});
