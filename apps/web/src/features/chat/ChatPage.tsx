import ComingSoonPage from '@/components/ui/ComingSoonPage';
import { getNavItemByPath } from '@/routes/navConfig';

const navItem = getNavItemByPath('/chat')!;

export default function ChatPage() {
  return (
    <ComingSoonPage
      title={navItem.label}
      weekLabel={navItem.weekLabel}
      description={navItem.description}
    />
  );
}
