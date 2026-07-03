import type { PromptPattern } from '@knowflow/prompts';

export type PromptTemplate = {
  id: string;
  name: string;
  pattern: PromptPattern;
  template: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePromptTemplateInput = {
  name: string;
  pattern: PromptPattern;
  template: string;
};
