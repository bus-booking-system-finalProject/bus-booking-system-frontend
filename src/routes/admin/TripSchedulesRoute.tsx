import { createRoute } from '@tanstack/react-router';
import { adminRoute } from './AdminRoute';
import StationsPage from '@/pages/admin/TripsPage';

export const tripSchedulesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/trips/schedules',
  component: StationsPage,
});
