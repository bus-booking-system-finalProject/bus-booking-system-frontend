import { createRoute } from '@tanstack/react-router';
import OAuthCallback from '@/pages/OAuthCallback.tsx';
import { indexRoute } from './IndexRoute.tsx';

export const oauthCallbackRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/oauth2/callback',
  component: OAuthCallback,
});
