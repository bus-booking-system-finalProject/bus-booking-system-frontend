import { createRoute } from '@tanstack/react-router';
import { adminRoute } from './AdminRoute';
import RoutesPage from '@/pages/admin/RoutesPage';

export const routeRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/routes',
  component: RoutesPage
});
