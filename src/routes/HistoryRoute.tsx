// src/routes/HistoryRoute.tsx
import { createRoute } from '@tanstack/react-router';
import { indexRoute } from './IndexRoute'; // Use indexRoute so it wraps with the Main Layout (Header)
import TicketHistoryPage from '@/pages/TicketHistoryPage';

export const historyRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/history',
  component: TicketHistoryPage,
});
