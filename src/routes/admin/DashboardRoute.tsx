import { createRoute } from '@tanstack/react-router';
import DashboardPage from '@/pages/DashboardPage';
import { adminRoute } from './AdminRoute';

export const dashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  component: DashboardPage,
});
