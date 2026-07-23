import DocumentList from '@/features/documents/DocumentList';
import DocumentUpload from '@/features/documents/DocumentUpload';
import { getNavItemByPath } from '@/routes/navConfig';
import styles from '@/features/documents/DocumentsPage.module.css';

const navItem = getNavItemByPath('/documents')!;

export default function DocumentsPage() {
  return (
    <article className={styles.page}>
      <p className={styles.pageBadge}>{navItem.weekLabel}</p>
      <h1>{navItem.label}</h1>
      <p className={styles.pageDescription}>{navItem.description}</p>
      <DocumentUpload />
      <DocumentList />
    </article>
  );
}
