import { createRoute, Outlet } from '@tanstack/react-router';
import { rootRoute } from '../RootRoute';
import { ProtectedRoute } from './ProtectedRoute';
import AdminRootLayout from '@/components/layout/AdminRootLayout';

export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <ProtectedRoute roles={['ADMIN']}>
      <AdminRootLayout>
        <Outlet />
      </AdminRootLayout>
    </ProtectedRoute>
  ),
});
