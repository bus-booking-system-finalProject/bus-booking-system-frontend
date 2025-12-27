// src/lib/api/BusesApi.ts
import { apiPrivate } from '@/lib/api/axios';
import type { Bus, SeatDefinition, ApiResponse } from '@/types/AdminTypes';

export const BusesApi = {
  getAll: async () => {
    const res = await apiPrivate.get<ApiResponse<Bus[]>>('/booking/buses');
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiPrivate.get<ApiResponse<Bus>>(`/booking/buses/${id}`);
    return res.data.data;
  },
  create: async (data: Omit<Bus, 'id'>) => {
    const res = await apiPrivate.post<ApiResponse<Bus>>('/booking/buses', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<Bus>) => {
    const res = await apiPrivate.put<ApiResponse<Bus>>(`/booking/buses/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    await apiPrivate.delete<ApiResponse<null>>(`/booking/buses/${id}`);
  },
  // Custom endpoint
  saveSeatMap: async (busId: string, seatDefinitions: SeatDefinition[]) => {
    const res = await apiPrivate.post(`/booking/buses/${busId}/seats/custom`, seatDefinitions);
    return res.data.data;
  },
};
