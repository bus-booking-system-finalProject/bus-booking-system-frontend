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

export interface BookingResponse {
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
