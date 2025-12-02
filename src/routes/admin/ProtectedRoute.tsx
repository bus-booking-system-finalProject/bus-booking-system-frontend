import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  roles?: string | string[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, children }) => {
  const { isLoggedIn, isLoadingUser, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingUser) {
      if (!isLoggedIn) {
        navigate({ to: '/' }); // Redirect to home, không dùng search params
      } else if (roles && !hasRole(roles)) {
        navigate({ to: '/' }); // Forbidden - redirect to home
      }
    }
  }, [isLoadingUser, isLoggedIn, roles, hasRole, navigate]);

  if (isLoadingUser) return <div>Loading...</div>;
  if (!isLoggedIn) return null;
  if (roles && !hasRole(roles)) return null;

  return <>{children}</>;
};
