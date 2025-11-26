import React, { useMemo, useEffect, useCallback, useState, useLayoutEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiPrivate } from '@/lib/api/axios';
import { getMe, refreshToken as refreshAuthToken, logoutUser } from '@/lib/api/auth';
import { type UserProfile } from '@/types/auth';
import { AuthContext } from '../hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // 1. State to hold the Access Token in MEMORY
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const {
    data: user,
    isLoading: isLoadingUser,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getMe,
    enabled: false, // We manually trigger this
    retry: false,
    staleTime: Infinity,
  });

  // 2. Login Function: Updates Token state + React Query Cache
  const login = useCallback(
    (userData: UserProfile, token: string) => {
      setAccessToken(token);
      queryClient.setQueryData(['currentUser'], userData);
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAccessToken(null); // Clear token from memory
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear();
    }
  }, [queryClient]);

  // 3. Check Auth on Load (Silent Refresh)
  // When the app loads, we have no Access Token. We try to fetch the user ('/me').
  // It will fail (401), trigger the interceptor, refresh the token, and retry.
  useEffect(() => {
    refetch();
  }, [refetch]);

  // 4. REQUEST INTERCEPTOR: Attach the Access Token to every request
  useLayoutEffect(() => {
    const authInterceptor = apiPrivate.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    return () => {
      apiPrivate.interceptors.request.eject(authInterceptor);
    };
  }, [accessToken]);

  // 5. RESPONSE INTERCEPTOR: Handle Token Expiration (401)
  useLayoutEffect(() => {
    const refreshInterceptor = apiPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true; // Prevent infinite loops

          try {
            // Attempt to get a new Access Token using the HttpOnly cookie
            const { accessToken: newAccessToken, user: userData } = await refreshAuthToken();

            // Save new data to state
            login(userData, newAccessToken);

            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiPrivate(originalRequest);
          } catch (refreshError) {
            // Refresh failed (cookie expired/invalid) -> Log out
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      apiPrivate.interceptors.response.eject(refreshInterceptor);
    };
  }, [login, logout]);

  // Reset user if initial query fails hard (not 401)
  useEffect(() => {
    if (isError) {
      setAccessToken(null);
      queryClient.setQueryData(['currentUser'], null);
    }
  }, [isError, queryClient]);

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
      accessToken,
      isLoggedIn,
      isLoadingUser,
      login,
      logout,
      hasRole,
    }),
    [user, accessToken, isLoggedIn, isLoadingUser, login, logout, hasRole],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
