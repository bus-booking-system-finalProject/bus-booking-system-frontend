import { createRoute } from '@tanstack/react-router';
import { indexRoute } from './IndexRoute';
import FindTicketPage from '@/pages/FindTicketPage';

export const findTicketRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/tickets',
  component: FindTicketPage,
});
