// src/routes/admin/AnalyticsRoute.tsx
import { createRoute } from '@tanstack/react-router';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import { adminRoute } from './AdminRoute';

export const analyticsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/analytics', // This creates the URL: /admin/analytics
  component: AdminDashboardPage,
});
