import { createRoute, Outlet } from '@tanstack/react-router';
import { rootRoute } from './RootRoute.tsx';
import Header from '@/components/layout/Header.tsx';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public-layout',
  component: () => (
    <>
      <Header />
      <Outlet />
    </>
  ),
});
