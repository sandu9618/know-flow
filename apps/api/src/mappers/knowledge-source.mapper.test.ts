import { describe, expect, it } from 'vitest';

import { toKnowledgeSourceListItem } from './knowledge-source.mapper.js';
import type { KnowledgeSource } from '../types/knowledge-source.types.js';

const sampleSource: KnowledgeSource = {
  id: '6a61e973d923b6f0e248762a',
  sourceType: 'file_upload',
  title: 'Refund Policy EU',
  status: 'acquired',
  sourceConfig: {
    filename: 'refund-policy-eu.pdf',
    bucketKey: 'uploads/6a61e973d923b6f0e248762a/refund-policy-eu.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1048576,
  },
  errorMessage: null,
  chunkCount: null,
  extractedText: 'Secret full document text',
  createdAt: new Date('2026-07-23T10:14:12.001Z'),
  acquiredAt: new Date('2026-07-23T10:14:12.001Z'),
  indexedAt: null,
};

describe('toKnowledgeSourceListItem', () => {
  it('returns metadata fields without bucket storage keys', () => {
    const listItem = toKnowledgeSourceListItem(sampleSource);

    expect(listItem).toEqual({
      id: sampleSource.id,
      sourceType: sampleSource.sourceType,
      title: sampleSource.title,
      status: sampleSource.status,
      sourceConfig: {
        filename: 'refund-policy-eu.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1048576,
      },
      errorMessage: null,
      chunkCount: null,
      createdAt: sampleSource.createdAt,
      acquiredAt: sampleSource.acquiredAt,
      indexedAt: null,
    });
    expect('bucketKey' in listItem.sourceConfig).toBe(false);
    expect('extractedText' in listItem).toBe(false);
  });
});
