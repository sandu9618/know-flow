import { useState } from 'react';
import {
  getUnfilledVariables,
  PROMPT_PATTERNS,
  substituteVariables,
  type PromptPattern,
} from '@knowflow/prompts';
import type { PromptTemplate } from '@/types/prompt-template.types';
import styles from '@/features/prompts/PromptTemplatePreview.module.css';

function getPatternDefinition(pattern: PromptPattern) {
  return PROMPT_PATTERNS.find((item) => item.id === pattern)!;
}

function formatVariableLabel(name: string): string {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface PromptTemplatePreviewProps {
  template: PromptTemplate;
  onClose: () => void;
}

export default function PromptTemplatePreview({
  template,
  onClose,
}: PromptTemplatePreviewProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  const patternDefinition = getPatternDefinition(template.pattern);
  const rendered = substituteVariables(template.template, values);
  const unfilled = getUnfilledVariables(template.variables, values);
  const hasVariables = template.variables.length > 0;

  function handleValueChange(variableName: string, nextValue: string) {
    setValues((previous) => ({ ...previous, [variableName]: nextValue }));
  }

  return (
    <section
      className={styles.preview}
      aria-labelledby="prompt-template-preview-heading"
    >
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 id="prompt-template-preview-heading">
            Preview: {template.name}
          </h2>
          <span className={styles.badge}>{patternDefinition.label}</span>
        </div>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>

      <p className={styles.helperText}>{patternDefinition.helperText}</p>

      {hasVariables ? (
        <div className={styles.variables}>
          {template.variables.map((variableName) => (
            <div key={variableName} className={styles.field}>
              <label htmlFor={`preview-variable-${variableName}`}>
                {formatVariableLabel(variableName)}
              </label>
              <input
                id={`preview-variable-${variableName}`}
                name={variableName}
                type="text"
                value={values[variableName] ?? ''}
                onChange={(event) =>
                  handleValueChange(variableName, event.target.value)
                }
                autoComplete="off"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noVariables} role="status">
          This template has no variables.
        </p>
      )}

      {unfilled.length > 0 && (
        <p className={styles.unfilledHint} role="status">
          Unfilled variables will appear as placeholders in the preview:{' '}
          {unfilled.join(', ')}
        </p>
      )}

      <div className={styles.outputSection}>
        <h3 className={styles.outputHeading}>Preview output</h3>
        <pre className={styles.output} aria-live="polite">
          {rendered}
        </pre>
      </div>
    </section>
  );
}
