import {
  CHARS_PER_TOKEN,
  CHUNK_OVERLAP_CHARS,
  MAX_CHUNK_CHARS,
  MIN_CHUNK_CHARS,
} from '../../constants/ingestion.constants.js';
import type { ChunkInput } from '../../types/chunk.types.js';

export function estimateTokenCount(text: string): number {
  return Math.max(1, Math.ceil(text.length / CHARS_PER_TOKEN));
}

function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+|\S+/g);
  return parts?.map((part) => part.trim()).filter(Boolean) ?? [text];
}

function overlapTail(text: string, overlapChars: number): string {
  if (text.length <= overlapChars) {
    return text;
  }

  return text.slice(-overlapChars).trimStart();
}

function pushChunk(chunks: ChunkInput[], text: string): void {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }

  chunks.push({
    index: chunks.length,
    text: trimmed,
    tokenCount: estimateTokenCount(trimmed),
  });
}

function splitOversizedBlock(block: string, chunks: ChunkInput[]): void {
  const sentences = splitSentences(block);
  let current = '';

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;

    if (candidate.length <= MAX_CHUNK_CHARS) {
      current = candidate;
      continue;
    }

    if (current) {
      pushChunk(chunks, current);
      current = overlapTail(current, CHUNK_OVERLAP_CHARS);
      current = current ? `${current} ${sentence}` : sentence;
      continue;
    }

    for (let offset = 0; offset < sentence.length; offset += MAX_CHUNK_CHARS) {
      pushChunk(chunks, sentence.slice(offset, offset + MAX_CHUNK_CHARS));
    }
    current = '';
  }

  if (current) {
    pushChunk(chunks, current);
  }
}

export function chunkText(text: string): ChunkInput[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return [];
  }

  if (normalized.length <= MAX_CHUNK_CHARS) {
    return [
      {
        index: 0,
        text: normalized,
        tokenCount: estimateTokenCount(normalized),
      },
    ];
  }

  const paragraphs = normalized.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const chunks: ChunkInput[] = [];
  let current = '';

  for (const paragraph of paragraphs) {
    if (paragraph.length > MAX_CHUNK_CHARS) {
      if (current) {
        pushChunk(chunks, current);
        current = overlapTail(current, CHUNK_OVERLAP_CHARS);
      }

      splitOversizedBlock(paragraph, chunks);
      current = '';
      continue;
    }

    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

    if (candidate.length <= MAX_CHUNK_CHARS) {
      current = candidate;

      if (current.length >= MIN_CHUNK_CHARS) {
        pushChunk(chunks, current);
        current = overlapTail(current, CHUNK_OVERLAP_CHARS);
      }

      continue;
    }

    pushChunk(chunks, current);
    current = overlapTail(current, CHUNK_OVERLAP_CHARS);
    current = current ? `${current}\n\n${paragraph}` : paragraph;
  }

  if (current.trim()) {
    const previous = chunks[chunks.length - 1];

    if (
      previous &&
      current.length < MIN_CHUNK_CHARS / 2 &&
      previous.text.length + current.length + 2 <= MAX_CHUNK_CHARS
    ) {
      previous.text = `${previous.text}\n\n${current.trim()}`;
      previous.tokenCount = estimateTokenCount(previous.text);
    } else {
      pushChunk(chunks, current);
    }
  }

  return chunks.map((chunk, index) => ({ ...chunk, index }));
}
