import { apiPrivate } from '../axios';
import type {
    TripCreateRequest,
    TripCreateResponse,
    TripUpdateRequest
} from '../../../types/admin/TripTypes';
import type { ApiResponse } from '@/types/CommonTypes';

export const TripsApi = {
    // Get all trips managed by the current operator
    getAll: async () => {
        const { data } = await apiPrivate.get<ApiResponse<TripCreateResponse[]>>('/admin/trips');
        return data.data;
    },

    // Get a single trip by ID
    getById: async (id: string) => {
        const { data } = await apiPrivate.get<ApiResponse<TripCreateResponse>>(`/admin/trips/${id}/details`);
        return data.data;
    },

    // Create a new trip
    create: async (tripData: TripCreateRequest) => {
        // Fixed typo: /amin/ -> /admin/
        const { data } = await apiPrivate.post<ApiResponse<TripCreateResponse>>(
            '/admin/trips',
            tripData
        );
        return data.data;
    },

    // Update an existing trip using TripUpdateRequest
    update: async ({ id, data }: { id: string; data: TripUpdateRequest }) => {
        const response = await apiPrivate.put<ApiResponse<TripCreateResponse>>(
            `/admin/trips/${id}`,
            data
        );
        return response.data.data;
    },

    // Delete a trip
    delete: async (id: string) => {
        const { data } = await apiPrivate.delete<ApiResponse<TripCreateResponse>>(`/admin/trips/${id}`);
        return data;
    },
};