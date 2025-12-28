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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
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
