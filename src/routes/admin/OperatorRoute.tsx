import { createRoute } from '@tanstack/react-router';
import { adminRoute } from './AdminRoute';
import OperatorsPage from '@/pages/admin/OperatorsPage';

export const operatorRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/operators',
  component: OperatorsPage
});
