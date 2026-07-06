import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import {
  extractVariables,
  PROMPT_PATTERNS,
  type PromptPattern,
} from '@knowflow/prompts';
import { ApiError } from '@/lib/api';
import { createPromptTemplate } from '@/features/prompts/promptTemplates.api';
import { promptTemplatesQueryKey } from '@/features/prompts/usePromptTemplates';
import styles from '@/features/prompts/PromptsPage.module.css';

const DEFAULT_PATTERN = PROMPT_PATTERNS[0].id;

function getPatternDefinition(pattern: PromptPattern) {
  return PROMPT_PATTERNS.find((item) => item.id === pattern)!;
}

export default function CreatePromptTemplateForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [pattern, setPattern] = useState<PromptPattern>(DEFAULT_PATTERN);
  const [template, setTemplate] = useState('');

  const {
    mutate,
    data: createdTemplate,
    error,
    isPending,
    reset,
  } = useMutation({
    mutationFn: createPromptTemplate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: promptTemplatesQueryKey });
      setName('');
      setPattern(DEFAULT_PATTERN);
      setTemplate('');
    },
  });

  const selectedPattern = getPatternDefinition(pattern);
  const detectedVariables = template.trim() ? extractVariables(template) : [];

  function handlePatternChange(nextPattern: PromptPattern) {
    const previousPattern = getPatternDefinition(pattern);
    setPattern(nextPattern);

    const nextDefinition = getPatternDefinition(nextPattern);
    if (!template.trim() || template === previousPattern.exampleStarter) {
      setTemplate(nextDefinition.exampleStarter);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reset();
    mutate({
      name: name.trim(),
      pattern,
      template: template.trim(),
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {createdTemplate && (
        <p className={styles.success} role="status">
          Template &ldquo;{createdTemplate.name}&rdquo; saved with variables:{' '}
          {createdTemplate.variables.length > 0
            ? createdTemplate.variables.join(', ')
            : 'none'}
        </p>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error instanceof ApiError
            ? error.message
            : 'Something went wrong while saving the template.'}
        </p>
      )}

      <div className={styles.field}>
        <label htmlFor="template-name">Name</label>
        <input
          id="template-name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="summarize-policy"
          autoComplete="off"
          required
          disabled={isPending}
        />
        <p className={styles.hint}>
          Letters, numbers, hyphens, and underscores (e.g. summarize-policy).
        </p>
      </div>

      <div className={styles.field}>
        <label htmlFor="template-pattern">Pattern</label>
        <select
          id="template-pattern"
          name="pattern"
          value={pattern}
          onChange={(event) => handlePatternChange(event.target.value as PromptPattern)}
          disabled={isPending}
        >
          {PROMPT_PATTERNS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <p className={styles.hint}>{selectedPattern.helperText}</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="template-text">Template</label>
        <textarea
          id="template-text"
          name="template"
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
          rows={10}
          placeholder="{{variable}} placeholders are extracted when you save."
          required
          disabled={isPending}
        />
        {detectedVariables.length > 0 && (
          <p className={styles.hint}>
            Variables detected: {detectedVariables.join(', ')}
          </p>
        )}
      </div>

      <div className={styles.actions}>
        <button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save template'}
        </button>
      </div>
    </form>
  );
}
