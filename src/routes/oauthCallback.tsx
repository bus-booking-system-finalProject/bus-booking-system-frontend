import { createRoute } from '@tanstack/react-router';
import OAuthCallback from '@/pages/OAuthCallback.tsx';
import { rootRoute } from './root.tsx';

export const oauthCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/oauth2/callback',
  component: OAuthCallback,
});
