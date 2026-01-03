import { createRoute } from '@tanstack/react-router';
import { adminRoute } from './AdminRoute';
import ProfilePage from '@/pages/admin/ProfilePage';

export const userRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/profile',
  component: ProfilePage,
});
