export type TripStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'DELAYED';

export type BusType = 'Limousine' | 'Sleeper' | 'Seater';

// Matches: "route": { "origin": "...", "destination": "...", "durationMinutes": 1800 }
export interface RouteInfo {
  name: string;
  pickup_points: StopPoint[];
  dropoff_points: StopPoint[];
  durationMinutes: number;
}

// Matches: "operator": { "name": "Futa Bus Lines" }
export interface OperatorInfo {
  id: string;
  name: string;
  image: string;
  ratings: {
    overall: number;
    reviews: number;
  };
}

// Matches: "bus": { "model": "...", "type": "..." }
export interface BusInfo {
  model: string;
  type: BusType;
  images?: string[]; // Optional in case backend adds it later
}

// Matches: "schedule": { "departureTime": "...", "arrivalTime": "..." }
export interface ScheduleInfo {
  hour: number;
  minute: number;
  departureTime: string;
  arrivalTime: string;
}

// Matches: "pricing": { "basePrice": 350000.00, "currency": "VND" }
export interface PricingInfo {
  original: number;
  discount: number;
}

// Matches: "availability": { "totalSeats": 36, "availableSeats": 30 }
export interface AvailabilityInfo {
  totalSeats: number;
  availableSeats: number;
}

// --- MAIN TRIP INTERFACE ---
export interface Trip {
  tripId: string;
  route: RouteInfo;
  operator: OperatorInfo;
  bus: BusInfo;
  schedules: ScheduleInfo;
  pricing: PricingInfo;
  availability: AvailabilityInfo;
  status: TripStatus;
  duration: number;
  pickupPoints: StopPoint[];
  dropoffPoints: StopPoint[];
  rating?: number;
  review_count?: number;
  from?: StopPoint;
  to?: StopPoint;
}

export type SeatStatus = 'available' | 'booked' | 'maintenance' | 'selected' | 'locked';

export interface Seat {
  seatId: string;
  seatCode: string;
  status: SeatStatus;
  price: number;
  type: string | null;
  deck: number;
  row: number;
  col: number;
}

export interface SeatLayout {
  tripId: string;
  totalDecks: number;
  gridRows: number;
  gridColumns: number;
  seats: Seat[];
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

// UPDATED: Matches the "GET /booking/tickets/{id}" response
export interface BookingResponse {
  ticketId: string;
  ticketCode: string;
  // tripId might be at root or inside tripDetails depending on endpoint, keeping it optional here to be safe
  tripId?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  seats: string[];

  // Contact Info (New)
  contactName: string;
  contactEmail: string;
  contactPhone: string;

  // Nested Trip Details (New - used in Checkout Page)
  tripDetails?: {
    tripId: string;
    route: string;
    operator: string;
    departureTime: string;
    arrivalTime: string;
  };

  pricing: {
    // Made optional because GET response snippet only showed total/currency
    subtotal?: number;
    serviceFee?: number;
    total: number;
    currency: string;
  };

  lockedUntil?: string;
  createdAt: string;
  confirmedAt?: string | null;
}

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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
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

export interface StopPoint {
  stopId: string;
  name: string;
  address: string;
  type: 'PICKUP' | 'DROPOFF';
  time: string; // ISO string
}

export interface Review {
  id: string;
  tripId: string;
  rating: number;
  comment: string;
  userEmail: string;
  submittedAt: string;
}

export interface OperatorReviewsResponse {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  pagination: {
    total: number;
    limit: number;
    totalPages: number;
    page: number;
  };
}
