import { apiPrivate } from './axios';
import type { Route } from '@/types/AdminTypes';

export const RoutesApi = {
  getAll: async () => {
    const res = await apiPrivate.get<Route[]>('/booking/routes');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiPrivate.get<Route>(`/booking/routes/${id}`);
    return res.data;
  },
  create: async (data: Omit<Route, 'id'>) => {
    const res = await apiPrivate.post<Route>('/booking/routes', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Route>) => {
    const res = await apiPrivate.put<Route>(`/booking/routes/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    await apiPrivate.delete(`/booking/routes/${id}`);
  },
};