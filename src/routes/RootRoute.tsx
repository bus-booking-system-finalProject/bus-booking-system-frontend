import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { UserProfile } from '@/types/auth';

// 1. Define the Context Interface
export interface RouterContext {
  auth: {
    isLoggedIn: boolean;
    user: UserProfile | null;
    isLoadingUser: boolean;
  };
}

// 2. Create Root Route using WithContext
export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
