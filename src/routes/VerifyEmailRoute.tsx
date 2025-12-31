import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@/routes/RootRoute';
import VerifyEmailPage from '@/pages/VerifyEmailPage';

// Defines /verify-email path
export const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-email',
  component: VerifyEmailPage,
});
