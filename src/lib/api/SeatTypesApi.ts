import { apiPrivate } from './axios';
import type { SeatType } from '@/types/AdminTypes';

export const SeatTypesApi = {
  create: async (data: Omit<SeatType, 'id'>) => {
    const res = await apiPrivate.post<SeatType>('/booking/seat-types', data);
    return res.data;
  },
  getByOperator: async (operatorId: string) => {
    const res = await apiPrivate.get<SeatType[]>(`/booking/seat-types/operator/${operatorId}`);
    return res.data;
  },
  delete: async (id: string) => {
    await apiPrivate.delete(`/booking/seat-types/${id}`);
  },
};