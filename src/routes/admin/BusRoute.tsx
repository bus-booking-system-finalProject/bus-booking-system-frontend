import { createRoute } from '@tanstack/react-router';
import { adminRoute } from './AdminRoute';
import BusesPage from '@/pages/admin/BusesPage';

export const busRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/buses',
  component: BusesPage
});
