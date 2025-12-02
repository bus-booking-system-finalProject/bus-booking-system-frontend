import { apiClient } from './axios';
import type { Trip } from '@/types/trip';

export interface SearchTripsParams {
  origin: string;
  destination: string;
  date: string;
  passengers?: number;
  page?: number;
  limit?: number;
  // Filters (passed directly as backend expects them)
  sort?: 'earliest' | 'latest' | 'lowest_price' | 'highest_rating';
  priceMin?: number;
  priceMax?: number;
  operators?: string[]; // Operator names (multi-select)
  busTypes?: string[]; // 'standard' | 'limousine' | 'sleeper' (single selection, array with 0 or 1 element)
  times?: string[]; // 'morning' | 'afternoon' | 'evening' | 'night' (single selection, array with 0 or 1 element)
}

export interface SearchResponse {
  success: boolean;
  data: Trip[];
  pagination: {
    total: number;
    limit: number;
    totalPages: number;
    page: number;
  };
}

export const searchTrips = async (params: SearchTripsParams): Promise<SearchResponse> => {
  // Prepare query params for backend
  const queryParams = {
    origin: params.origin,
    destination: params.destination,
    date: params.date,
    passengers: params.passengers || 1,
    page: params.page || 1,
    limit: params.limit || 20,
    sort: params.sort,
    minPrice: params.priceMin,
    maxPrice: params.priceMax,
    // busType and departureTime are now single-selection (0 or 1 value in array)
    busType: params.busTypes && params.busTypes.length > 0 ? params.busTypes[0] : undefined,
    departureTime: params.times && params.times.length > 0 ? params.times[0] : undefined,
  };

  // Remove undefined keys for clean URL
  const cleanParams = Object.fromEntries(
    Object.entries(queryParams).filter(
      ([_, v]) => v != null && v !== '' && (Array.isArray(v) ? v.length > 0 : true),
    ),
  );

  const response = await apiClient.get<SearchResponse>('/booking/trips/search', {
    params: cleanParams,
  });
  return response.data;
};
