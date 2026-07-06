import PromptTemplateForm from '@/features/prompts/PromptTemplateForm';
import PromptTemplateList from '@/features/prompts/PromptTemplateList';
import { getNavItemByPath } from '@/routes/navConfig';
import type { PromptTemplate } from '@/types/prompt-template.types';
import { useState } from 'react';
import styles from '@/features/prompts/PromptsPage.module.css';

const navItem = getNavItemByPath('/prompts')!;

export default function PromptsPage() {
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(
    null,
  );

  return (
    <article className={styles.page}>
      <p className={styles.pageBadge}>{navItem.weekLabel}</p>
      <h1>{navItem.label}</h1>
      <p className={styles.pageDescription}>{navItem.description}</p>
      <PromptTemplateList
        onEdit={setEditingTemplate}
        onDeleted={(deletedId) => {
          if (editingTemplate?.id === deletedId) {
            setEditingTemplate(null);
          }
        }}
      />
      {editingTemplate ? (
        <PromptTemplateForm
          key={editingTemplate.id}
          mode="edit"
          editingTemplate={editingTemplate}
          onCancel={() => setEditingTemplate(null)}
          onSuccess={() => setEditingTemplate(null)}
        />
      ) : (
        <PromptTemplateForm mode="create" />
      )}
    </article>
  );
}
