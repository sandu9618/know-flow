export type ConversationMessageRole = 'user' | 'assistant';

export type ConversationMessage = {
  role: ConversationMessageRole;
  content: string;
  timestamp: Date;
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
    citations?: string[];
  }>;
  createdAt: string;
  updatedAt: string;
};
