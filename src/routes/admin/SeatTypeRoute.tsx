import { createRoute } from '@tanstack/react-router';
import { adminRoute } from './AdminRoute';
import SeatTypesPage from '@/pages/admin/SeatTypesPage';

export const seatTypeRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/seat-types',
  component: SeatTypesPage
});
