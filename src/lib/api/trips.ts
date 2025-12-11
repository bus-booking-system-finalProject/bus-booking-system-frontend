import { apiClient, apiPrivate } from './axios';
import type {
  Trip,
  SeatLayout,
  CreateBookingRequest,
  BookingResponse,
  LockSeatsRequest,
  LockSeatsResponse,
  UnlockSeatsRequest,
  UnlockSeatsResponse,
} from '@/types/trip';

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

// 1. Define the wrapper based on your JSON
interface TripDetailResponse {
  success: boolean;
  data: Trip;
}

export const getTripById = async (tripId: string): Promise<Trip> => {
  // 2. Fetch the wrapper
  const response = await apiClient.get<TripDetailResponse>(`/booking/trips/${tripId}`);

  // 3. IMPORTANT: Return the inner 'data' property
  // This ensures the component receives the actual Trip object, not the wrapper.
  return response.data.data;
};

interface SeatResponseWrapper {
  success: boolean;
  data: SeatLayout;
}

export const getTripSeats = async (tripId: string): Promise<SeatLayout> => {
  const response = await apiClient.get<SeatResponseWrapper>(`/booking/trips/${tripId}/seats`);
  return response.data.data;
};

export const createBooking = async (data: CreateBookingRequest): Promise<BookingResponse> => {
  // CHANGE: Use 'apiPrivate' here so the token is attached automatically
  const response = await apiPrivate.post<BookingResponse>('/booking/tickets', data);
  return response.data;
};

export const getBookingById = async (ticketId: string): Promise<BookingResponse> => {
  // Using apiPrivate because viewing a booking usually requires auth
  const response = await apiPrivate.get<BookingResponse>(`/booking/tickets/${ticketId}`);
  return response.data;
};

export const lockSeats = async (data: LockSeatsRequest): Promise<LockSeatsResponse> => {
  // Use apiClient (public) or apiPrivate depending on your security.
  // Usually locking is public but requires the session ID.
  const response = await apiClient.post<LockSeatsResponse>('/booking/tickets/lock', data);
  return response.data;
};

export const unlockSeats = async (data: UnlockSeatsRequest): Promise<UnlockSeatsResponse> => {
  const response = await apiClient.post<UnlockSeatsResponse>('/booking/tickets/unlock', data);
  return response.data;
};
