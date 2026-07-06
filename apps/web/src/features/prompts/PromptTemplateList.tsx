import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  PROMPT_PATTERNS,
  type PromptPattern,
  type PromptPatternDefinition,
} from '@knowflow/prompts';
import { ApiError } from '@/lib/api';
import { deletePromptTemplate } from '@/features/prompts/promptTemplates.api';
import {
  promptTemplatesQueryKey,
  usePromptTemplates,
} from '@/features/prompts/usePromptTemplates';
import type { PromptTemplate } from '@/types/prompt-template.types';
import styles from '@/features/prompts/PromptTemplateList.module.css';

const ALL_PATTERNS = '' as const;

type PatternFilter = PromptPattern | typeof ALL_PATTERNS;

function formatVariableCount(count: number): string {
  return count === 1 ? '1 variable' : `${count} variables`;
}

function getPatternDefinition(pattern: PromptPattern): PromptPatternDefinition {
  return PROMPT_PATTERNS.find((item) => item.id === pattern)!;
}

function groupTemplatesByPattern(
  templates: PromptTemplate[],
  patternFilter: PatternFilter,
): { pattern: PromptPatternDefinition; templates: PromptTemplate[] }[] {
  const filtered =
    patternFilter === ALL_PATTERNS
      ? templates
      : templates.filter((template) => template.pattern === patternFilter);

  return PROMPT_PATTERNS.map((pattern) => ({
    pattern,
    templates: filtered.filter((template) => template.pattern === pattern.id),
  })).filter((section) => section.templates.length > 0);
}

interface PromptTemplateListProps {
  onEdit: (template: PromptTemplate) => void;
  onPreview: (template: PromptTemplate) => void;
  onDeleted?: (deletedId: string) => void;
}

export default function PromptTemplateList({
  onEdit,
  onPreview,
  onDeleted,
}: PromptTemplateListProps) {
  const queryClient = useQueryClient();
  const { data: templates = [], isLoading, error } = usePromptTemplates();
  const [patternFilter, setPatternFilter] = useState<PatternFilter>(ALL_PATTERNS);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    mutate: deleteTemplate,
    isPending: isDeleting,
    variables: deletingId,
  } = useMutation({
    mutationFn: deletePromptTemplate,
    onSuccess: (_data, deletedId) => {
      setDeleteError(null);
      void queryClient.invalidateQueries({ queryKey: promptTemplatesQueryKey });
      onDeleted?.(deletedId);
    },
    onError: (mutationError) => {
      setDeleteError(
        mutationError instanceof ApiError
          ? mutationError.message
          : 'Something went wrong while deleting the template.',
      );
    },
  });

  const sections = useMemo(
    () => groupTemplatesByPattern(templates, patternFilter),
    [templates, patternFilter],
  );

  const hasTemplates = templates.length > 0;
  const hasVisibleTemplates = sections.length > 0;

  function handleDelete(template: PromptTemplate) {
    const confirmed = window.confirm(
      `Delete template "${template.name}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleteError(null);
    deleteTemplate(template.id);
  }

  return (
    <section className={styles.list} aria-labelledby="prompt-templates-heading">
      <div className={styles.toolbar}>
        <h2 id="prompt-templates-heading">Saved templates</h2>
        {hasTemplates && (
          <div className={styles.filter}>
            <label htmlFor="template-pattern-filter">Filter by pattern</label>
            <select
              id="template-pattern-filter"
              value={patternFilter}
              onChange={(event) =>
                setPatternFilter(event.target.value as PatternFilter)
              }
            >
              <option value={ALL_PATTERNS}>All patterns</option>
              {PROMPT_PATTERNS.map((pattern) => (
                <option key={pattern.id} value={pattern.id}>
                  {pattern.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading && (
        <p className={styles.status} role="status">
          Loading templates…
        </p>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error instanceof ApiError
            ? error.message
            : 'Something went wrong while loading templates.'}
        </p>
      )}

      {deleteError && (
        <p className={styles.error} role="alert">
          {deleteError}
        </p>
      )}

      {!isLoading && !error && !hasTemplates && (
        <p className={styles.empty} role="status">
          No templates yet — create one below.
        </p>
      )}

      {!isLoading && !error && hasTemplates && !hasVisibleTemplates && (
        <p className={styles.empty} role="status">
          No templates match this pattern.
        </p>
      )}

      {!isLoading && !error && hasVisibleTemplates && (
        <div className={styles.sections}>
          {sections.map((section) => (
            <section key={section.pattern.id} className={styles.section}>
              <h3 className={styles.sectionHeading}>{section.pattern.label}</h3>
              <ul className={styles.items}>
                {section.templates.map((template) => {
                  const patternDefinition = getPatternDefinition(template.pattern);
                  const isDeletingThisTemplate =
                    isDeleting && deletingId === template.id;

                  return (
                    <li key={template.id} className={styles.item}>
                      <p className={styles.itemName}>{template.name}</p>
                      <span className={styles.badge}>{patternDefinition.label}</span>
                      <span className={styles.variableCount}>
                        {formatVariableCount(template.variables.length)}
                      </span>
                      <div className={styles.itemActions}>
                        <button
                          type="button"
                          className={styles.previewButton}
                          onClick={() => onPreview(template)}
                          disabled={isDeletingThisTemplate}
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          className={styles.editButton}
                          onClick={() => onEdit(template)}
                          disabled={isDeletingThisTemplate}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => handleDelete(template)}
                          disabled={isDeletingThisTemplate}
                          aria-label={`Delete template ${template.name}`}
                        >
                          {isDeletingThisTemplate ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
