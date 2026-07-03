import type { PromptPattern } from '@knowflow/prompts';

export type PromptTemplate = {
  id: string;
  name: string;
  pattern: PromptPattern;
  template: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreatePromptTemplateRequest = {
  name: string;
  pattern: PromptPattern;
  template: string;
};
