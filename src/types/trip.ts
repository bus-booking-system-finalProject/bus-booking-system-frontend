export type TripStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'DELAYED';

export type BusType = 'Limousine' | 'Sleeper' | 'Seater';

// Matches: "route": { "origin": "...", "destination": "...", "durationMinutes": 1800 }
export interface RouteInfo {
  origin: string;
  destination: string;
  durationMinutes: number;
}

// Matches: "operator": { "name": "Futa Bus Lines" }
export interface OperatorInfo {
  name: string;
}

// Matches: "bus": { "model": "...", "type": "..." }
export interface BusInfo {
  model: string;
  type: BusType;
  images?: string[]; // Optional in case backend adds it later
}

// Matches: "schedule": { "departureTime": "...", "arrivalTime": "..." }
export interface ScheduleInfo {
  departureTime: string;
  arrivalTime: string;
}

// Matches: "pricing": { "basePrice": 350000.00, "currency": "VND" }
export interface PricingInfo {
  basePrice: number;
  currency: string;
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
  schedule: ScheduleInfo;
  pricing: PricingInfo;
  availability: AvailabilityInfo;
  status: TripStatus;
  // These might be missing from backend, so make them optional or default them in UI
  rating?: number;
  review_count?: number;
}

export type SeatStatus = 'available' | 'booked' | 'maintenance' | 'selected';

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
