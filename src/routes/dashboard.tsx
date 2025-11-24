import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import DashboardPage from '@/pages/DashboardPage';
import { ProtectedRoute } from './ProtectedRoute';

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute roles={['ADMIN']}>
      <DashboardPage />
    </ProtectedRoute>
  ),
});
