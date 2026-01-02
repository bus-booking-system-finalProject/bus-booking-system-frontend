import { createRoute, Outlet } from '@tanstack/react-router';
import { rootRoute } from '../RootRoute';
import { ProtectedRoute } from './ProtectedRoute';
import AdminRootLayout from '@/components/layout/AdminRootLayout';
import { UserRole } from '@/types/enum/UserRole';

export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <ProtectedRoute roles={[UserRole.OPERATOR]}>
      <AdminRootLayout>
        <Outlet />
      </AdminRootLayout>
    </ProtectedRoute>
  ),
});
