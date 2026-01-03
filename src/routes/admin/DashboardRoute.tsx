import { createRoute } from '@tanstack/react-router';
import { adminRoute } from './AdminRoute';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';

export const dashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  component: AdminDashboardPage,
});
