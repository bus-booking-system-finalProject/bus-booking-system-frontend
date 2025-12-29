export interface LockSeatsRequest {
  tripId: string;
  seats: string[];
  sessionId: string;
}

export interface LockSeatsResponse {
  success: boolean;
  message: string;
}

export interface UnlockSeatsRequest {
  tripId: string;
  seats: string[];
  sessionId: string;
}

export interface UnlockSeatsResponse {
  success: boolean;
  message: string;
}

export interface CreateBookingRequest {
  tripId: string;
  seats: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  isGuestCheckout: boolean;
  sessionId: string;
  pickupId: string;
  dropoffId: string;
}

// Matches the "GET /booking/tickets/{id}" response
export interface BookingResponse {
  ticketId: string;
  ticketCode: string;
  // tripId might be at root or inside tripDetails depending on endpoint, keeping it optional here to be safe
  tripId?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  seats: string[];

  // Contact Info
  contactName: string;
  contactEmail: string;
  contactPhone: string;

  // Nested Trip Details
  tripDetails?: {
    tripId: string;
    route: string;
    operator: string;
    departureTime: string;
    arrivalTime: string;
  };

  pricing: {
    subtotal?: number;
    serviceFee?: number;
    total: number;
    currency: string;
  };

  lockedUntil?: string;
  createdAt: string;
  confirmedAt?: string | null;
}

export interface TicketHistoryItem {
  ticketId: string;
  ticketCode: string;
  trip: {
    route: string;
    departureTime: string;
    operator: string;
  };
  seats: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface TicketHistoryResponse {
  success: boolean;
  data: TicketHistoryItem[];
  pagination: {
    total: number;
    limit: number;
    totalPages: number;
    page: number;
  };
}

export interface CancelTicketResponse {
  ticketId: string;
  status: string;
  refund: {
    amount: number;
    percentage: number;
    status: string;
    processingTime: string | null;
    refundMethod: string | null;
  };
  cancelledAt: string;
}

// --- GUEST LOOKUP ---
export interface GuestLookupRequest {
  ticketCode: string; // The reference code (e.g. VXS-12345)
  verificationValue: string; // Phone or Email
}

export interface TripDetails {
  operator: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
}

export interface PricingDetails {
  total: number;
}

export interface TicketLookupResponse {
  ticketId: string;
  ticketCode: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  seats: string[];
  tripDetails: TripDetails;
  pricing: PricingDetails;
}
