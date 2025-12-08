// src/lib/api/OperatorsApi.ts
import { apiPrivate } from './axios';
import type { Operator, ApiResponse } from '@/types/AdminTypes';

export const OperatorsApi = {
  getAll: async () => {
    const res = await apiPrivate.get<ApiResponse<Operator[]>>('/booking/operators');
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiPrivate.get<ApiResponse<Operator>>(`/booking/operators/${id}`);
    return res.data.data;
  },
  create: async (data: Omit<Operator, 'id'>) => {
    const res = await apiPrivate.post<ApiResponse<Operator>>('/booking/operators', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<Operator>) => {
    const res = await apiPrivate.put<ApiResponse<Operator>>(`/booking/operators/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    await apiPrivate.delete<ApiResponse<null>>(`/booking/operators/${id}`);
  },
};
