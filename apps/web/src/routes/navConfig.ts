export interface NavItem {
  label: string;
  path: string;
  week: number;
  weekLabel: string;
  description: string;
  implemented: boolean;
}

export const navItems: NavItem[] = [
  {
    label: 'Prompt Templates',
    path: '/prompts',
    week: 1,
    weekLabel: 'Week 1',
    description: 'Select a pattern, fill variables, and preview the final prompt.',
    implemented: true,
  },
  {
    label: 'Documents',
    path: '/documents',
    week: 2,
    weekLabel: 'Week 2',
    description: 'Upload PDF and TXT files as knowledge sources.',
    implemented: true,
  },
  {
    label: 'Chat',
    path: '/chat',
    week: 2,
    weekLabel: 'Week 2',
    description: 'Ask questions about your knowledge library with cited answers.',
    implemented: true,
  },
  {
    label: 'Search',
    path: '/search',
    week: 4,
    weekLabel: 'Week 4',
    description: 'Semantic search across indexed documents with ranked snippets.',
    implemented: false,
  },
  {
    label: 'Agents',
    path: '/agents',
    week: 5,
    weekLabel: 'Weeks 5–7',
    description: 'Run research agents with step-by-step logs and tool use.',
    implemented: false,
  },
  {
    label: 'Cost Dashboard',
    path: '/cost',
    week: 10,
    weekLabel: 'Week 10',
    description: 'Track token usage and estimated LLM spend over time.',
    implemented: false,
  },
];

export function getNavItemByPath(path: string): NavItem | undefined {
  return navItems.find((item) => item.path === path);
}
