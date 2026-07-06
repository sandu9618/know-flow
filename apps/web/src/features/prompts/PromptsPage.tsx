import CreatePromptTemplateForm from '@/features/prompts/CreatePromptTemplateForm';
import PromptTemplateList from '@/features/prompts/PromptTemplateList';
import { getNavItemByPath } from '@/routes/navConfig';
import styles from '@/features/prompts/PromptsPage.module.css';

const navItem = getNavItemByPath('/prompts')!;

export default function PromptsPage() {
  return (
    <article className={styles.page}>
      <p className={styles.pageBadge}>{navItem.weekLabel}</p>
      <h1>{navItem.label}</h1>
      <p className={styles.pageDescription}>{navItem.description}</p>
      <PromptTemplateList />
      <CreatePromptTemplateForm />
    </article>
  );
}
