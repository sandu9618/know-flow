export type Chunk = {
  id: string;
  sourceId: string;
  index: number;
  text: string;
  tokenCount: number;
  createdAt: Date;
};

export type ChunkInput = {
  index: number;
  text: string;
  tokenCount: number;
};

export type ChunkEmbeddingUpdate = {
  index: number;
  embedding: number[];
};

export type VectorSearchHit = {
  id: string;
  sourceId: string;
  index: number;
  text: string;
  score: number;
};
