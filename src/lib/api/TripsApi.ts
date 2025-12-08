// src/lib/api/TripsApi.ts
import { apiPrivate, apiClient } from './axios';
import type {
  Trip,
  TripSearchRequest,
  PaginatedResponse,
  SeatMapResponse,
  ApiResponse,
} from '@/types/AdminTypes';

export const TripsApi = {
  // --- Admin/CRUD Operations ---
  create: async (data: Omit<Trip, 'id'>) => {
    const res = await apiPrivate.post<ApiResponse<Trip>>('/booking/trips', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<Trip>) => {
    const res = await apiPrivate.put<ApiResponse<Trip>>(`/booking/trips/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    await apiPrivate.delete<ApiResponse<null>>(`/trips/${id}`);
  },

  // --- Public/User Operations ---
  search: async (params: TripSearchRequest) => {
    // Backend: { success: true, data: [...], pagination: {...} }
    // PaginatedResponse matches this structure, so we return res.data directly.
    const res = await apiClient.get<PaginatedResponse<Trip>>('/booking/trips/search', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Trip>>(`/booking/trips/${id}`);
    return res.data.data;
  },
  getSeatMap: async (tripId: string) => {
    const res = await apiClient.get<ApiResponse<SeatMapResponse>>(`/booking/trips/${tripId}/seats`);
    return res.data.data;
  },
};
