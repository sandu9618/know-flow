export const LIBRARY_CONVERSATION_KEY = '000000000000000000000001';

export const LIBRARY_PICKER_VALUE = '__library__';

export type ChatScope = 'source' | 'library';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  citations?: string[];
};

export type AskChatRequest = {
  question: string;
  scope: ChatScope;
  sourceId?: string;
};

export type AskChatResponse = {
  answer: string;
  sourceId: string;
  model: string;
  conversationId: string;
};

export type ConversationMessageDto = {
  role: ChatRole;
  content: string;
  timestamp: string;
  citations?: string[];
};

export type ConversationDto = {
  id: string;
  sourceId: string;
  messages: ConversationMessageDto[];
  createdAt: string;
  updatedAt: string;
};

export type ChatStreamTokenEvent = {
  type: 'token';
  text: string;
};

export type ChatStreamDoneEvent = {
  type: 'done';
  sourceId: string;
  model: string;
  conversationId: string;
};

export type ChatStreamErrorEvent = {
  type: 'error';
  code: string;
  message: string;
};

export type ChatStreamEvent =
  | ChatStreamTokenEvent
  | ChatStreamDoneEvent
  | ChatStreamErrorEvent;
