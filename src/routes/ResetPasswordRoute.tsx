import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@/routes/RootRoute';
import ResetPasswordPage from '@/pages/ResetPasswordPage';

// Defines /reset-password path
export const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPasswordPage,
});
