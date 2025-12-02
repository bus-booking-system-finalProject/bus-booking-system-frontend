import { apiPrivate } from './axios';
import type { Bus, SeatDefinition } from '@/types/AdminTypes';

export const BusesApi = {
  getAll: async () => {
    const res = await apiPrivate.get<Bus[]>('/booking/buses');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiPrivate.get<Bus>(`/booking/buses/${id}`);
    return res.data;
  },
  create: async (data: Omit<Bus, 'id'>) => {
    const res = await apiPrivate.post<Bus>('/booking/buses', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Bus>) => {
    const res = await apiPrivate.put<Bus>(`/booking/buses/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    await apiPrivate.delete(`/booking/buses/${id}`);
  },
  // Custom endpoint from BusController
  saveSeatMap: async (busId: string, seatDefinitions: SeatDefinition[]) => {
    const res = await apiPrivate.post(`/booking/buses/${busId}/seats/custom`, seatDefinitions);
    return res.data;
  },
};