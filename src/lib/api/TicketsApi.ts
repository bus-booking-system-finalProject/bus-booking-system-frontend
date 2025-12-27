import { apiClient, apiPrivate } from '@/lib/api/axios';
import type {
  GuestLookupRequest,
  TicketLookupResponse,
  LockSeatsRequest,
  LockSeatsResponse,
  UnlockSeatsRequest,
  UnlockSeatsResponse,
  CreateBookingRequest,
} from '@/types/tickets';

export const createBooking = async (data: CreateBookingRequest): Promise<TicketLookupResponse> => {
  // CHANGE: Use 'apiPrivate' here so the token is attached automatically
  const response = await apiPrivate.post<TicketLookupResponse>('/booking/tickets', data);
  return response.data;
};

export const getBookingById = async (ticketId: string): Promise<TicketLookupResponse> => {
  // Using apiPrivate because viewing a booking usually requires auth
  const response = await apiPrivate.get<TicketLookupResponse>(`/booking/tickets/${ticketId}`);
  return response.data;
};

export const lookupBooking = async (data: GuestLookupRequest): Promise<TicketLookupResponse> => {
  const response = await apiClient.post<{ success: boolean; data: TicketLookupResponse }>(
    `/booking/tickets/lookup`,
    data,
  );
  return response.data.data;
};

export const lockSeats = async (data: LockSeatsRequest): Promise<LockSeatsResponse> => {
  const response = await apiClient.post<LockSeatsResponse>('/booking/tickets/lock', data);
  return response.data;
};

export const unlockSeats = async (data: UnlockSeatsRequest): Promise<UnlockSeatsResponse> => {
  const response = await apiClient.post<UnlockSeatsResponse>('/booking/tickets/unlock', data);
  return response.data;
};
