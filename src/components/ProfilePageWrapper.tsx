import ProfilePage from '@/pages/ProfilePage';
import { useAuth } from '@/hooks/useAuth';

// Wrapper to Force Remount when User ID Changes
export function ProfilePageWrapper() {
  const { user } = useAuth();

  // The 'key' forces React to destroy and recreate ProfilePage
  // whenever the user loads or changes.
  // This removes the need for useEffect inside ProfilePage to sync state.
  return <ProfilePage key={user?.id || 'loading'} />;
}
