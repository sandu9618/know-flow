import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import styles from '@/components/layout/AppShell.module.css';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <div className={styles.shell}>
      <AppHeader onMenuToggle={toggleSidebar} isSidebarOpen={sidebarOpen} />
      <div className={styles.body}>
        {sidebarOpen && (
          <button
            type="button"
            className={styles.backdrop}
            onClick={closeSidebar}
            aria-label="Close navigation menu"
          />
        )}
        <AppSidebar isOpen={sidebarOpen} onNavigate={closeSidebar} />
        <main id="main-content" className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
