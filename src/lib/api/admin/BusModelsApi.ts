import { apiPrivate } from '@/lib/api/axios';
import type { BusModelRequest, BusModelResponse, BusModelDetailsResponse } from '@/types/admin/BusTypes';
import type { ApiResponse } from '@/types/CommonTypes';

export const BusModelsApi = {
    getAll: async () => {
        const { data } = await apiPrivate.get<ApiResponse<BusModelResponse[]>>('/admin/buses/models');
        return data.data;
    },
    create: async (model: BusModelRequest) => {
        const { data } = await apiPrivate.post<ApiResponse<BusModelResponse>>('/admin/buses/models', model);
        return data;
    },
    getDetails: async (id: string) => {
        const { data } = await apiPrivate.get<ApiResponse<BusModelDetailsResponse>>(`/admin/buses/models/${id}`);
        return data.data;
    },
    update: async (id: string, model: BusModelRequest) => {
        const { data } = await apiPrivate.put<ApiResponse<BusModelResponse>>(`/admin/buses/models/${id}`, model);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await apiPrivate.delete<ApiResponse<BusModelResponse>>(`/admin/buses/models/${id}`);
        return data;
    },
};