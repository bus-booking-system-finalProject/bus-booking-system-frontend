import { createRoute } from '@tanstack/react-router';
import { adminRoute } from './AdminRoute';
import TripsPage from '@/pages/admin/TripsPage';

export const tripRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/trips',
  component: TripsPage,
});
