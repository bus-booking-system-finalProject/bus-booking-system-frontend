// src/lib/api/AnalyticsApi.ts
import { apiPrivate } from '@/lib/api/axios';
import type {
  AnalyticsSummary,
  RevenueTrend,
  PopularRoute,
  ConversionRate,
  AnalyticsParams,
  ApiResponse,
} from '@/types/analytics';

// Helper to attach token
const getAuthConfig = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getSummaryStats = async (
  token: string,
  params: AnalyticsParams,
): Promise<AnalyticsSummary> => {
  const response = await apiPrivate.get<ApiResponse<AnalyticsSummary>>('/admin/analytics/summary', {
    ...getAuthConfig(token),
    params,
  });
  return response.data.data;
};

export const getBookingTrends = async (
  token: string,
  params: AnalyticsParams,
): Promise<RevenueTrend[]> => {
  const response = await apiPrivate.get<ApiResponse<RevenueTrend[]>>('/admin/analytics/trends', {
    ...getAuthConfig(token),
    params,
  });
  return response.data.data;
};

export const getPopularRoutes = async (
  token: string,
  params: AnalyticsParams,
  limit = 5,
): Promise<PopularRoute[]> => {
  const response = await apiPrivate.get<ApiResponse<PopularRoute[]>>(
    '/admin/analytics/routes/popular',
    {
      ...getAuthConfig(token),
      params: { ...params, limit },
    },
  );
  return response.data.data;
};

export const getConversionRate = async (
  token: string,
  params: AnalyticsParams,
): Promise<ConversionRate> => {
  const response = await apiPrivate.get<ApiResponse<ConversionRate>>(
    '/admin/analytics/conversion',
    {
      ...getAuthConfig(token),
      params,
    },
  );
  return response.data.data;
};
