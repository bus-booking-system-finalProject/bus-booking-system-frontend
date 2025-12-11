import { apiClient } from './axios';
import type { GuestLookupRequest, BookingResponse } from '@/types/tickets';

export const lookupBooking = async (data: GuestLookupRequest): Promise<BookingResponse> => {
  // Note: The backend likely expects a POST for a lookup with body data
  // Adjust endpoint path as per your backend controller
  const response = await apiClient.post<{ success: boolean; data: BookingResponse }>(
    `/booking/tickets/lookup`,
    data,
  );
  return response.data.data;
};
