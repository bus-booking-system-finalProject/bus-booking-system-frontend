// src/hooks/admin/useAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import * as AnalyticsApi from '@/lib/api/AnalyticsApi';
import type { AnalyticsParams } from '@/types/analytics';

export const useAnalytics = (params: AnalyticsParams) => {
  const { accessToken } = useAuth();
  const isEnabled = !!accessToken;

  // 1. Summary Query
  const summary = useQuery({
    queryKey: ['admin-summary', params, accessToken],
    queryFn: () => AnalyticsApi.getSummaryStats(accessToken!, params),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  // 2. Trends Query
  const trends = useQuery({
    queryKey: ['admin-trends', params, accessToken],
    queryFn: () => AnalyticsApi.getBookingTrends(accessToken!, params),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
  });

  // 3. Popular Routes Query
  const popularRoutes = useQuery({
    queryKey: ['admin-routes-popular', params, accessToken],
    queryFn: () => AnalyticsApi.getPopularRoutes(accessToken!, params),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
  });

  // 4. Conversion Rate Query
  const conversion = useQuery({
    queryKey: ['admin-conversion', params, accessToken],
    queryFn: () => AnalyticsApi.getConversionRate(accessToken!, params),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading =
    summary.isLoading || trends.isLoading || popularRoutes.isLoading || conversion.isLoading;
  const isError = summary.isError || trends.isError || popularRoutes.isError || conversion.isError;

  return {
    summary,
    trends,
    popularRoutes,
    conversion,
    isLoading,
    isError,
  };
};
