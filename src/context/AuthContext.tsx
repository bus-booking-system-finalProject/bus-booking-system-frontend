import React, { createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiPrivate } from '@/lib/api/axios';
import { getMe, refreshToken as refreshAuthToken, logoutUser } from '@/lib/api/auth';
import { type UserProfile } from '@/types/auth';

// --- 1. Define Types ---

type User = UserProfile;

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  accessToken: string | null;
  isLoadingUser: boolean;
  login: (data: UserProfile) => void; // Function to handle successful login
  logout: () => void; // Function to handle logout
  hasRole: (required: string | string[]) => boolean; // added (simplified)
}

// --- 2. Create the Context ---

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 3. Auth Provider Component ---

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Use React Query to fetch the user's profile
  const {
    data: user,
    isLoading: isLoadingUser,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getMe,
    enabled: false, // !!IMPORTANT!! Only run query if we have a token
    retry: 1,
    staleTime: Infinity, // User profile data rarely changes during a session
  });

  // --- Check auth status on load ---
  useEffect(() => {
    // Try to get user profile. This will either succeed or fail (401).
    // If it fails, the interceptor will try to refresh.
    // If refresh succeeds, getMe will be re-run and succeed.
    // If refresh fails, isError will become true.
    refetch();
  }, [refetch]);

  const logout = useCallback(async () => {
    // Call the backend to clear cookies
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always clear user state
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear();
    }
  }, [queryClient]);

  const login = useCallback(
    (data: UserProfile) => {
      // Login was successful, backend set cookies.
      // Just set the user state.
      queryClient.setQueryData(['currentUser'], data);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    [queryClient],
  );

  // Handle 'getMe' or 'refresh' failure
  useEffect(() => {
    if (isError) {
      // This means getMe failed and the refresh interceptor also failed.
      // We are truly logged out.
      queryClient.setQueryData(['currentUser'], null);
    }
  }, [isError, queryClient]);

  // --- 4. Setup Axios Interceptors ---
  useEffect(() => {
    const responseIntercept = apiPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            // --- CHANGED: refreshAuthToken() returns UserProfile ---
            const newUser = await refreshAuthToken();
            // We logged in successfully, set the user
            login(newUser);
            // Retry the original request (it will now have the new cookie)
            return apiPrivate(originalRequest);
          } catch (refreshError) {
            logout(); // Force logout
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      // apiPrivate.interceptors.request.eject(requestIntercept);
      apiPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [login, logout]); // Re-run when auth functions change

  const isLoggedIn = !!user;

  const hasRole = useCallback(
    (required: string | string[]) => {
      if (!user) return false;
      const needed = Array.isArray(required) ? required : [required];
      return needed.includes(user.role);
    },
    [user],
  );

  const contextValue = useMemo(
    () => ({
      user: user || null,
      accessToken: null,
      isLoggedIn,
      isLoadingUser,
      login,
      logout,
      hasRole, // expose
    }),
    [user, isLoggedIn, isLoadingUser, login, logout, hasRole],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// --- 5. Custom Hook for Usage ---

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
