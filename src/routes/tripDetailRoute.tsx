// routes/TripDetailRoute.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './RootRoute';
import TripDetailPage from '@/pages/TripDetailPage';

export const tripDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trip/$tripId', // $tripId is dynamic parameter
  component: TripDetailPage,
});
