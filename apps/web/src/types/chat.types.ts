export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type AskChatRequest = {
  sourceId: string;
  question: string;
};

export type AskChatResponse = {
  answer: string;
  sourceId: string;
  model: string;
};

export type ChatStreamTokenEvent = {
  type: 'token';
  text: string;
};

export type ChatStreamDoneEvent = {
  type: 'done';
  sourceId: string;
  model: string;
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
