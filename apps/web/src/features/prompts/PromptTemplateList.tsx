import { useMemo, useState } from 'react';
import {
  PROMPT_PATTERNS,
  type PromptPattern,
  type PromptPatternDefinition,
} from '@knowflow/prompts';
import { ApiError } from '@/lib/api';
import { usePromptTemplates } from '@/features/prompts/usePromptTemplates';
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
}

export default function PromptTemplateList({ onEdit }: PromptTemplateListProps) {
  const { data: templates = [], isLoading, error } = usePromptTemplates();
  const [patternFilter, setPatternFilter] = useState<PatternFilter>(ALL_PATTERNS);

  const sections = useMemo(
    () => groupTemplatesByPattern(templates, patternFilter),
    [templates, patternFilter],
  );

  const hasTemplates = templates.length > 0;
  const hasVisibleTemplates = sections.length > 0;

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

                  return (
                    <li key={template.id} className={styles.item}>
                      <p className={styles.itemName}>{template.name}</p>
                      <span className={styles.badge}>{patternDefinition.label}</span>
                      <span className={styles.variableCount}>
                        {formatVariableCount(template.variables.length)}
                      </span>
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => onEdit(template)}
                      >
                        Edit
                      </button>
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
