import PromptTemplateForm from '@/features/prompts/PromptTemplateForm';
import PromptTemplateList from '@/features/prompts/PromptTemplateList';
import PromptTemplatePreview from '@/features/prompts/PromptTemplatePreview';
import { getNavItemByPath } from '@/routes/navConfig';
import type { PromptTemplate } from '@/types/prompt-template.types';
import { useState } from 'react';
import styles from '@/features/prompts/PromptsPage.module.css';

const navItem = getNavItemByPath('/prompts')!;

export default function PromptsPage() {
  const [previewingTemplate, setPreviewingTemplate] =
    useState<PromptTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(
    null,
  );

  function handleEdit(template: PromptTemplate) {
    setPreviewingTemplate(null);
    setEditingTemplate(template);
  }

  function handlePreview(template: PromptTemplate) {
    setEditingTemplate(null);
    setPreviewingTemplate(template);
  }

  function handleDeleted(deletedId: string) {
    if (editingTemplate?.id === deletedId) {
      setEditingTemplate(null);
    }
    if (previewingTemplate?.id === deletedId) {
      setPreviewingTemplate(null);
    }
  }

  return (
    <article className={styles.page}>
      <p className={styles.pageBadge}>{navItem.weekLabel}</p>
      <h1>{navItem.label}</h1>
      <p className={styles.pageDescription}>{navItem.description}</p>
      <PromptTemplateList
        onEdit={handleEdit}
        onPreview={handlePreview}
        onDeleted={handleDeleted}
      />
      {previewingTemplate ? (
        <PromptTemplatePreview
          key={previewingTemplate.id}
          template={previewingTemplate}
          onClose={() => setPreviewingTemplate(null)}
        />
      ) : editingTemplate ? (
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
