import { ObjectId } from 'mongodb';
import type { Express } from 'express';
import { bucketClient } from '../clients/bucket.client.js';
import { ingestionQueueClient } from '../clients/ingestion-queue.client.js';
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_BYTES,
} from '../constants/documents.constants.js';
import { AppError } from '../errors/AppError.js';
import { chunksRepository } from '../repositories/chunks.repository.js';
import { knowledgeSourcesRepository } from '../repositories/knowledge-sources.repository.js';
import {
  buildFileUploadSourceConfig,
  deriveTitle,
} from './acquisition/file-upload.adapter.js';
import { toKnowledgeSourceListItem } from '../mappers/knowledge-source.mapper.js';
import type { KnowledgeSource, KnowledgeSourceListItem } from '../types/knowledge-source.types.js';

type UploadedFile = Express.Multer.File;

function isAllowedMimeType(mimeType: string): mimeType is (typeof ALLOWED_UPLOAD_MIME_TYPES)[number] {
  return (ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(mimeType);
}

export const documentsService = {
  async list(): Promise<KnowledgeSourceListItem[]> {
    const sources = await knowledgeSourcesRepository.findAll();
    return sources.map(toKnowledgeSourceListItem);
  },

  async acquireFileUpload(input: {
    file: UploadedFile | undefined;
    title?: string;
  }): Promise<KnowledgeSource> {
    const file = input.file;

    if (!file?.buffer?.length) {
      throw new AppError('FILE_REQUIRED', 'No file uploaded', 400);
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new AppError(
        'FILE_TOO_LARGE',
        'File exceeds the 25 MB upload limit',
        413,
      );
    }

    if (!isAllowedMimeType(file.mimetype)) {
      throw new AppError(
        'INVALID_FILE_TYPE',
        'Only PDF and TXT files are supported',
        400,
      );
    }

    const sourceId = new ObjectId().toHexString();
    const sourceConfig = buildFileUploadSourceConfig({
      sourceId,
      filename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    });

    try {
      await bucketClient.uploadObject({
        key: sourceConfig.bucketKey,
        body: file.buffer,
        mimeType: file.mimetype,
      });
    } catch {
      throw new AppError('BUCKET_UPLOAD_FAILED', 'Failed to store uploaded file', 503);
    }

    const source = await knowledgeSourcesRepository.insertFileUpload({
      id: sourceId,
      title: deriveTitle(file.originalname, input.title),
      sourceConfig,
    });

    try {
      await ingestionQueueClient.enqueueIngestSource(source.id);
    } catch {
      await bucketClient.deleteObject(sourceConfig.bucketKey).catch(() => undefined);
      await knowledgeSourcesRepository.deleteById(source.id).catch(() => undefined);
      throw new AppError(
        'INGESTION_ENQUEUE_FAILED',
        'Could not start processing for the uploaded file',
        503,
      );
    }

    return source;
  },

  async reingest(id: string): Promise<KnowledgeSourceListItem> {
    const source = await knowledgeSourcesRepository.findById(id);

    if (!source) {
      throw new AppError('SOURCE_NOT_FOUND', 'Knowledge source not found', 404);
    }

    if (source.status !== 'failed') {
      throw new AppError(
        'SOURCE_NOT_FAILED',
        'Only a failed knowledge source can be re-indexed',
        409,
      );
    }

    const updated = await knowledgeSourcesRepository.updateStatus(id, 'acquired', null);

    if (!updated) {
      throw new AppError('SOURCE_NOT_FOUND', 'Knowledge source not found', 404);
    }

    try {
      await ingestionQueueClient.enqueueIngestSource(id);
    } catch {
      await knowledgeSourcesRepository
        .updateStatus(id, 'failed', 'Could not start indexing for this knowledge source')
        .catch(() => undefined);
      throw new AppError(
        'INGESTION_ENQUEUE_FAILED',
        'Could not start indexing for this knowledge source',
        503,
      );
    }

    return toKnowledgeSourceListItem(updated);
  },

  async delete(id: string): Promise<void> {
    const source = await knowledgeSourcesRepository.findById(id);

    if (!source) {
      throw new AppError('SOURCE_NOT_FOUND', 'Knowledge source not found', 404);
    }

    if (source.status === 'indexing') {
      throw new AppError(
        'SOURCE_INDEXING',
        'This knowledge source is still indexing. Wait until it finishes before removing it.',
        409,
      );
    }

    await chunksRepository.deleteBySourceId(id);
    const deleted = await knowledgeSourcesRepository.deleteById(id);

    if (!deleted) {
      throw new AppError('SOURCE_NOT_FOUND', 'Knowledge source not found', 404);
    }

    await bucketClient.deleteObject(source.sourceConfig.bucketKey);
  },
};
