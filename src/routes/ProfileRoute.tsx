import { createRoute, redirect } from '@tanstack/react-router';
import { rootRoute } from '@/routes/RootRoute'; // Import rootRoute to link parent
import ProfilePage from '@/pages/ProfilePage';
import { useAuth } from '@/hooks/useAuth';

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

// 2. Wrapper to Force Remount when User ID Changes
function ProfilePageWrapper() {
  const { user } = useAuth();

  // The 'key' forces React to destroy and recreate ProfilePage
  // whenever the user loads or changes.
  // This removes the need for useEffect inside ProfilePage to sync state.
  return <ProfilePage key={user?.id || 'loading'} />;
}
