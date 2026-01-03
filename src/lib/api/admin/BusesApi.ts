import { apiPrivate } from '@/lib/api/axios';
import type { BusRequest, BusResponse } from '@/types/admin/BusTypes';
import type { ApiResponse } from '@/types/CommonTypes';

export const BusesApi = {
  getAll: async () => {
    const { data } = await apiPrivate.get<ApiResponse<BusResponse[]>>('/admin/buses');
    return data.data;
  },
  create: async (bus: BusRequest) => {
    const { data } = await apiPrivate.post<ApiResponse<BusResponse>>('/admin/buses', bus);
    return data;
  },
  update: async (id: string, bus: BusRequest) => {
    const { data } = await apiPrivate.put<ApiResponse<BusResponse>>(`/admin/buses/${id}`, bus);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await apiPrivate.delete<ApiResponse<null>>(`/admin/buses/${id}`);
    return data;
  },
};
