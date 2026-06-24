import ComingSoonPage from '@/components/ui/ComingSoonPage';
import { getNavItemByPath } from '@/routes/navConfig';

const navItem = getNavItemByPath('/documents')!;

export default function DocumentsPage() {
  return (
    <ComingSoonPage
      title={navItem.label}
      weekLabel={navItem.weekLabel}
      description={navItem.description}
    />
  );
}
