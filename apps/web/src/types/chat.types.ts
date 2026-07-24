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
