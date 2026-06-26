import { NavLink } from 'react-router-dom';
import { navItems } from '@/routes/navConfig';
import styles from '@/components/layout/AppShell.module.css';

export interface AppSidebarProps {
  isOpen: boolean;
  onNavigate: () => void;
}

export default function AppSidebar({ isOpen, onNavigate }: AppSidebarProps) {
  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}`}
      aria-label="Main navigation"
      aria-hidden={!isOpen}
    >
      <nav className={styles.sidebarNav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
            onClick={onNavigate}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
