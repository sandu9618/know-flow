import type { CitationDto } from './citation.types.js';

export type ConversationMessageRole = 'user' | 'assistant';

export type ConversationMessage = {
  role: ConversationMessageRole;
  content: string;
  timestamp: Date;
  /** Stored chunk IDs only (Mongo). */
  citations?: string[];
};

export type Conversation = {
  id: string;
  sourceId: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
};

export type ConversationDto = {
  id: string;
  sourceId: string;
  messages: Array<{
    role: ConversationMessageRole;
    content: string;
    timestamp: string;
    /** Enriched citations for API clients (hydrated from chunk IDs). */
    citations?: CitationDto[];
  }>;
  createdAt: string;
  updatedAt: string;
};
