import { apiPrivate } from './axios';
import type { Operator } from '@/types/AdminTypes';

export const OperatorsApi = {
  getAll: async () => {
    const res = await apiPrivate.get<Operator[]>('/booking/operators');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiPrivate.get<Operator>(`/booking/operators/${id}`);
    return res.data;
  },
  create: async (data: Omit<Operator, 'id'>) => {
    const res = await apiPrivate.post<Operator>('/booking/operators', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Operator>) => {
    const res = await apiPrivate.put<Operator>(`/booking/operators/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    await apiPrivate.delete(`/booking/operators/${id}`);
  },
};