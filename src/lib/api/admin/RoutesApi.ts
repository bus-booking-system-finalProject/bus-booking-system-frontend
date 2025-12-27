import { apiPrivate } from '@/lib/api/axios';
import type { Route, ApiResponse } from '@/types/AdminTypes';

export const RoutesApi = {
  getAll: async () => {
    const res = await apiPrivate.get<ApiResponse<Route[]>>('/booking/routes');
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiPrivate.get<ApiResponse<Route>>(`/booking/routes/${id}`);
    return res.data.data;
  },
  create: async (data: Omit<Route, 'id'>) => {
    const res = await apiPrivate.post<ApiResponse<Route>>('/booking/routes', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<Route>) => {
    const res = await apiPrivate.put<ApiResponse<Route>>(`/booking/routes/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    await apiPrivate.delete<ApiResponse<null>>(`/booking/routes/${id}`);
  },
};
