import { apiPrivate } from '@/lib/api/axios';
import type { RouteRequest, RouteResponse } from '@/types/admin/RouteTypes';
import type { ApiResponse } from '@/types/CommonTypes';

export const RoutesApi = {
  getAll: async () => {
    const { data } = await apiPrivate.get<ApiResponse<RouteResponse[]>>('/admin/routes');
    return data.data;
  },
  getById: async (id: string) => {
    const { data } = await apiPrivate.get<ApiResponse<RouteResponse>>(`/admin/routes/${id}`);
    return data;
  },
  create: async (route: RouteRequest) => {
    const { data } = await apiPrivate.post<ApiResponse<RouteResponse>>('/admin/routes', route);
    return data;
  },
  update: async (id: string, route: RouteRequest) => {
    const { data } = await apiPrivate.put<ApiResponse<RouteResponse>>(`/admin/routes/${id}`, route);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await apiPrivate.delete<ApiResponse<RouteResponse>>(`/admin/routes/${id}`);
    return data;
  },
};
