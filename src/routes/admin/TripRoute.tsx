import { createRoute } from '@tanstack/react-router';
import { adminRoute } from './AdminRoute';
import TripsPage from '@/pages/admin/TripsPage'; // Fixed import name from StationsPage

export const tripRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'trips', // Changed to relative path 'trips' (removed leading slash for consistency)
  component: TripsPage,
});
