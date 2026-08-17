import type { CitationDto } from '../types/citation.types.js';
import type { Chunk } from '../types/chunk.types.js';

export function toCitationDto(
  chunk: Pick<Chunk, 'id' | 'sourceId' | 'index' | 'text'>,
  sourceTitle: string,
): CitationDto {
  return {
    chunkId: chunk.id,
    sourceId: chunk.sourceId,
    sourceTitle,
    chunkIndex: chunk.index,
    text: chunk.text,
  };
}
