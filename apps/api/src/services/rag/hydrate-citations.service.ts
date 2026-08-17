import { toCitationDto } from '../../mappers/citation.mapper.js';
import { chunksRepository } from '../../repositories/chunks.repository.js';
import { knowledgeSourcesRepository } from '../../repositories/knowledge-sources.repository.js';
import type { CitationDto } from '../../types/citation.types.js';

/**
 * Resolve stored chunk IDs to enriched citation DTOs.
 * Missing/deleted chunks are omitted (e.g. after re-index).
 * Output order matches the input ID list (duplicates preserved when both resolve).
 */
export async function hydrateCitations(chunkIds: string[]): Promise<CitationDto[]> {
  if (chunkIds.length === 0) {
    return [];
  }

  const byId = await loadCitationMap(chunkIds);
  const citations: CitationDto[] = [];

  for (const chunkId of chunkIds) {
    const citation = byId.get(chunkId);
    if (citation) {
      citations.push(citation);
    }
  }

  return citations;
}

export async function loadCitationMap(chunkIds: string[]): Promise<Map<string, CitationDto>> {
  const uniqueIds = [...new Set(chunkIds)];
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const chunks = await chunksRepository.findByIds(uniqueIds);
  const sourceIds = [...new Set(chunks.map((chunk) => chunk.sourceId))];
  const sources = await knowledgeSourcesRepository.findByIds(sourceIds);
  const titleBySourceId = new Map(sources.map((source) => [source.id, source.title]));

  return new Map(
    chunks.map((chunk) => [
      chunk.id,
      toCitationDto(chunk, titleBySourceId.get(chunk.sourceId) ?? 'Unknown source'),
    ]),
  );
}
