import ComingSoonPage from '@/components/ui/ComingSoonPage';
import { getNavItemByPath } from '@/routes/navConfig';

const navItem = getNavItemByPath('/agents')!;

export default function AgentsPage() {
  return (
    <ComingSoonPage
      title={navItem.label}
      weekLabel={navItem.weekLabel}
      description={navItem.description}
    />
  );
}
