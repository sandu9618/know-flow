import ComingSoonPage from '@/components/ui/ComingSoonPage';
import { getNavItemByPath } from '@/routes/navConfig';

const navItem = getNavItemByPath('/search')!;

export default function SearchPage() {
  return (
    <ComingSoonPage
      title={navItem.label}
      weekLabel={navItem.weekLabel}
      description={navItem.description}
    />
  );
}
