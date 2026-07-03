export const PROMPT_PATTERN_VALUES = [
  'role-based-prompting',
  'few-shot',
  'chain-of-thought',
  'structured-output',
  'prompt-chaining',
] as const;

export type PromptPattern = (typeof PROMPT_PATTERN_VALUES)[number];

export interface PromptPatternDefinition {
  id: PromptPattern;
  label: string;
  helperText: string;
  exampleStarter: string;
}

export const PROMPT_PATTERNS: readonly PromptPatternDefinition[] = [
  {
    id: 'role-based-prompting',
    label: 'Role-based prompting',
    helperText:
      'Assign a persona or expertise (e.g. senior engineer, support agent) to shape tone and depth of responses.',
    exampleStarter: 'You are a {{role}}. Respond to:\n\n{{request}}',
  },
  {
    id: 'few-shot',
    label: 'Few-shot',
    helperText:
      'Include one or more input/output examples so the model learns the desired style before processing new input.',
    exampleStarter:
      'Example input: {{example_input}}\nExample output: {{example_output}}\n\nNow process:\n{{text}}',
  },
  {
    id: 'chain-of-thought',
    label: 'Chain-of-thought',
    helperText:
      'Ask the model to reason step by step before producing a final answer — improves accuracy on complex tasks.',
    exampleStarter: 'Think step by step, then answer.\n\nQuestion: {{question}}',
  },
  {
    id: 'structured-output',
    label: 'Structured output',
    helperText:
      'Request output in a fixed structure (e.g. JSON or fields) — useful for downstream parsing and tool integration.',
    exampleStarter: 'Return structured output matching this schema for:\n\n{{input}}',
  },
  {
    id: 'prompt-chaining',
    label: 'Prompt chaining',
    helperText:
      'Break a task into linked steps where each prompt builds on the previous output — useful for multi-stage workflows.',
    exampleStarter:
      'Step 1 — analyze the following:\n\n{{input}}\n\nStep 2 — using that analysis, {{next_step}}',
  },
] as const;

const patternSet = new Set<string>(PROMPT_PATTERN_VALUES);

export function isValidPattern(value: unknown): value is PromptPattern {
  return typeof value === 'string' && patternSet.has(value);
}
