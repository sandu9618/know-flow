import ComingSoonPage from '@/components/ui/ComingSoonPage';
import { getNavItemByPath } from '@/routes/navConfig';

const navItem = getNavItemByPath('/cost')!;

export default function CostDashboardPage() {
  return (
    <ComingSoonPage
      title={navItem.label}
      weekLabel={navItem.weekLabel}
      description={navItem.description}
    />
  );
}
