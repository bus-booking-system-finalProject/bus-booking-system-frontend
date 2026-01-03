import { apiClient, apiPrivate } from './axios';
import qs from 'qs';
import type {
  Trip,
  SeatLayout,
  CreateBookingRequest,
  BookingResponse,
  OperatorReviewsResponse,
  TicketHistoryResponse,
  CancelTicketResponse,
  FeedbackResponse,
} from '@/types/TripTypes';

export interface SearchTripsParams {
  origin: string;
  destination: string;
  date: string;
  timezone?: string;
  passengers?: number;
  page?: number;
  limit?: number;
  // Filters (passed directly as backend expects them)
  sort?: 'earliest' | 'latest' | 'lowest_price' | 'highest_rating';
  operator?: string[];
  priceMin?: number;
  priceMax?: number;
  operators?: string[]; // Operator names (multi-select)
  busTypes?: string[]; // 'standard' | 'limousine' | 'sleeper' (single selection, array with 0 or 1 element)
  minTime?: string;
  maxTime?: string;
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
    timezone: params.timezone,
    passengers: params.passengers || 1,
    page: params.page || 1,
    limit: params.limit || 20,
    sort: params.sort,
    minPrice: params.priceMin,
    maxPrice: params.priceMax,
    minDepartureTime: params.minTime,
    maxDepartureTime: params.maxTime,
    operators: params.operators,
    busTypes: params.busTypes,
  };

  // Remove undefined keys for clean URL
  const cleanParams = Object.fromEntries(
    Object.entries(queryParams).filter(
      ([_, v]) => v != null && v !== '' && (Array.isArray(v) ? v.length > 0 : true),
    ),
  );

  const response = await apiClient.get<SearchResponse>('/booking/trips/search', {
    params: cleanParams,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
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

export const getMyTickets = async (page = 1, limit = 5): Promise<TicketHistoryResponse> => {
  const response = await apiPrivate.get<TicketHistoryResponse>('/booking/tickets', {
    params: { page, limit },
  });
  return response.data;
};

export const cancelTicket = async (ticketId: string): Promise<CancelTicketResponse> => {
  const response = await apiPrivate.put<CancelTicketResponse>(
    `/booking/tickets/${ticketId}/cancel`,
    {},
  );
  return response.data;
};

export const getOperatorReviews = async (
  operatorId: string,
  page = 1,
  limit = 5,
): Promise<OperatorReviewsResponse> => {
  // Using apiClient because authentication is not required for viewing reviews
  const response = await apiClient.get<{ success: boolean; data: OperatorReviewsResponse }>(
    `/booking/reviews/${operatorId}`,
    {
      params: { page, limit },
    },
  );
  return response.data.data;
};

export const getMyFeedback = async (tripId: string): Promise<FeedbackResponse | null> => {
  const response = await apiPrivate.get<{ success: boolean; data: FeedbackResponse | null }>(
    '/booking/feedback/me',
    { params: { tripId } },
  );
  return response.data.data;
};
