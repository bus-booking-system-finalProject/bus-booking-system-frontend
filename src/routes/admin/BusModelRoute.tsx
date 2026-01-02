import { createRoute } from '@tanstack/react-router';
import { adminRoute } from './AdminRoute';
import BusModelsPage from '@/pages/admin/BusModelsPage';

export const busModelsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'bus-models',
  component: BusModelsPage,
});
