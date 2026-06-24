import styles from '@/components/layout/AppShell.module.css';

export interface AppHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export default function AppHeader({ onMenuToggle, isSidebarOpen }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onMenuToggle}
        aria-label="Toggle navigation menu"
        aria-expanded={isSidebarOpen}
      >
        ☰
      </button>
      <h1 className={styles.brand}>KnowFlow</h1>
    </header>
  );
}
