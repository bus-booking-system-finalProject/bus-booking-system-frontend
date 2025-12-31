import { createRoute } from '@tanstack/react-router';
import { adminRoute } from './AdminRoute';
import UsersPage from '@/pages/admin/UsersPage';

export const userRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/users', // This results in /admin/users URL in the browser
  component: UsersPage,
});
