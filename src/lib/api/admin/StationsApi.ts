import { apiPrivate } from '@/lib/api/axios';
import type { StationRequest, StationResponse } from '@/types/admin/StationTypes';
import type { ApiResponse } from '@/types/CommonTypes';
export const StationsApi = {
    getAll: async () => {
        const { data } = await apiPrivate.get<ApiResponse<StationResponse[]>>('/admin/stations');
        return data.data;
    },
    create: async (station: StationRequest) => {
        const { data } = await apiPrivate.post<ApiResponse<StationResponse>>('/admin/stations', station);
        return data;
    },
    update: async (id: string, station: StationRequest) => {
        const { data } = await apiPrivate.put<ApiResponse<StationResponse>>(`/admin/stations/${id}`, station);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await apiPrivate.delete(`/admin/stations/${id}`);
        return data;
    },
};