import HomePage from '../pages/HomePage.tsx';
import { createRoute } from '@tanstack/react-router';
import { indexRoute } from './IndexRoute.tsx';

export const HomeRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/',
  component: HomePage,
});
