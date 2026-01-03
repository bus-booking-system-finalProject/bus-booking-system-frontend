import { createRoute, redirect } from '@tanstack/react-router';
import { rootRoute } from '@/routes/RootRoute'; // Import rootRoute to link parent
import { ProfilePageWrapper } from '@/components/ProfilePageWrapper';

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePageWrapper, // Use the wrapper
  beforeLoad: ({ context }) => {
    // 1. Check Auth Context
    // We wait for loading to finish, then check if logged in
    if (!context.auth.isLoadingUser && !context.auth.isLoggedIn) {
      throw redirect({
        to: '/',
        // Optional: you can pass search params here to show a login modal
        // search: { login: true }
      });
    }
  },
});
