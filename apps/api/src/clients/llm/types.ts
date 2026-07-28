export type LlmRole = 'system' | 'user' | 'assistant';

export type LlmMessage = {
  role: LlmRole;
  content: string;
};

export type LlmChatOptions = {
  temperature?: number;
  maxOutputTokens?: number;
};

export type LlmChatResult = {
  content: string;
  model: string;
};

export type LlmClient = {
  chat(messages: LlmMessage[], options?: LlmChatOptions): Promise<LlmChatResult>;
  stream(messages: LlmMessage[], options?: LlmChatOptions): AsyncIterable<string>;
  getModelId(): string;
};
