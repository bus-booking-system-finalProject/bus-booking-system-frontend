import { createRoute } from '@tanstack/react-router';
import { adminRoute } from './AdminRoute'; // Assuming this is your parent admin layout route
import StationsPage from '@/pages/admin/StationsPage';

export const stationsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'stations',
  component: StationsPage,
});
