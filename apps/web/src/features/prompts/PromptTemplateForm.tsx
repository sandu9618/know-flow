import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import {
  extractVariables,
  PROMPT_PATTERNS,
  type PromptPattern,
} from '@knowflow/prompts';
import { ApiError } from '@/lib/api';
import {
  createPromptTemplate,
  updatePromptTemplate,
} from '@/features/prompts/promptTemplates.api';
import { promptTemplatesQueryKey } from '@/features/prompts/usePromptTemplates';
import type { PromptTemplate } from '@/types/prompt-template.types';
import styles from '@/features/prompts/PromptsPage.module.css';

const DEFAULT_PATTERN = PROMPT_PATTERNS[0].id;

function getPatternDefinition(pattern: PromptPattern) {
  return PROMPT_PATTERNS.find((item) => item.id === pattern)!;
}

type PromptTemplateFormProps =
  | {
      mode: 'create';
      editingTemplate?: never;
      onCancel?: never;
      onSuccess?: never;
    }
  | {
      mode: 'edit';
      editingTemplate: PromptTemplate;
      onCancel: () => void;
      onSuccess?: () => void;
    };

export default function PromptTemplateForm(props: PromptTemplateFormProps) {
  const { mode } = props;
  const queryClient = useQueryClient();

  const [name, setName] = useState(
    mode === 'edit' ? props.editingTemplate.name : '',
  );
  const [pattern, setPattern] = useState<PromptPattern>(
    mode === 'edit' ? props.editingTemplate.pattern : DEFAULT_PATTERN,
  );
  const [template, setTemplate] = useState(
    mode === 'edit' ? props.editingTemplate.template : '',
  );

  const {
    mutate,
    data: savedTemplate,
    error,
    isPending,
    reset,
  } = useMutation({
    mutationFn: (input: { name: string; pattern: PromptPattern; template: string }) =>
      mode === 'edit'
        ? updatePromptTemplate(props.editingTemplate.id, input)
        : createPromptTemplate(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: promptTemplatesQueryKey });
      if (mode === 'create') {
        setName('');
        setPattern(DEFAULT_PATTERN);
        setTemplate('');
      } else {
        props.onSuccess?.();
      }
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

  function handleCancel() {
    if (mode === 'edit') {
      props.onCancel();
    }
  }

  const heading = mode === 'edit' ? 'Edit template' : 'Create template';
  const submitLabel = mode === 'edit' ? 'Save changes' : 'Save template';
  const pendingLabel = mode === 'edit' ? 'Saving changes…' : 'Saving…';

  return (
    <section className={styles.formSection} aria-labelledby="prompt-template-form-heading">
      <h2 id="prompt-template-form-heading">{heading}</h2>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {savedTemplate && (
          <p className={styles.success} role="status">
            Template &ldquo;{savedTemplate.name}&rdquo;{' '}
            {mode === 'edit' ? 'updated' : 'saved'} with variables:{' '}
            {savedTemplate.variables.length > 0
              ? savedTemplate.variables.join(', ')
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
            onChange={(event) =>
              handlePatternChange(event.target.value as PromptPattern)
            }
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
            {isPending ? pendingLabel : submitLabel}
          </button>
          {mode === 'edit' && (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
