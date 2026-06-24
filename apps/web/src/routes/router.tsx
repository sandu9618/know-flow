import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import NotFoundPage from '@/components/ui/NotFoundPage';
import AgentsPage from '@/features/agents/AgentsPage';
import ChatPage from '@/features/chat/ChatPage';
import CostDashboardPage from '@/features/cost/CostDashboardPage';
import DocumentsPage from '@/features/documents/DocumentsPage';
import PromptsPage from '@/features/prompts/PromptsPage';
import SearchPage from '@/features/search/SearchPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/prompts" replace /> },
      { path: 'prompts', element: <PromptsPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'agents', element: <AgentsPage /> },
      { path: 'cost', element: <CostDashboardPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
