import { apiPrivate, apiClient } from './axios';
import type { Trip, TripSearchRequest, PaginatedResponse, SeatMapResponse } from '@/types/AdminTypes';

export const TripsApi = {
  // --- Admin/CRUD Operations ---
  create: async (data: Omit<Trip, 'id'>) => {
    const res = await apiPrivate.post<Trip>('/booking/trips', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Trip>) => {
    const res = await apiPrivate.put<Trip>(`/booking/trips/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    await apiPrivate.delete(`/trips/${id}`);
  },
  
  // --- Public/User Operations ---
  // Using apiClient (public) for search if authentication is not required, 
  // otherwise switch to apiPrivate if your controller logic demands it.
  search: async (params: TripSearchRequest) => {
    const res = await apiClient.get<PaginatedResponse<Trip>>('/booking/trips/search', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Trip }>(`/booking/trips/${id}`);
    return res.data.data;
  },
  getSeatMap: async (tripId: string) => {
    const res = await apiClient.get<{ success: boolean; data: SeatMapResponse }>(`/booking/trips/${tripId}/seats`);
    return res.data.data;
  }
};