export type BusType = 'SLEEPER' | 'LIMOUSINE' | 'SEATER' | 'VIP';
export type TripStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';

// --- SHARED / GENERIC ---
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// --- OPERATOR ---
export interface Operator {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
}

// --- BUS ---
export interface Bus {
  id: string;
  operatorId: string;
  operatorName: string;
  plateNumber: string;
  model: string;
  type: BusType;
  seatCapacity: number;
}

// --- ROUTE ---
export interface Route {
  id: string;
  operator: Operator;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedMinutes: number;
}

// --- TRIP ---
export interface Trip {
  id: string;
  routeId: string;
  busId: string;
  departureTime: string; // ISO String
  arrivalTime: string; // ISO String
  basePrice: number;
  status: TripStatus;
  // Expanded fields from backend
  route?: Route;
  bus?: Bus;
}

// --- SEAT DEFINITION ---
export interface SeatDefinition {
  seatCode: string;
  row: number;
  col: number;
  deck: number; // 1 or 2
  isAvailable?: boolean; // Used in SeatMapResponse
  price?: number; // Used in SeatMapResponse
}

// --- RESPONSE DTOs (New) ---
export interface SeatMapResponse {
  tripId: string;
  busId: string;
  seats: SeatDefinition[];
}

export interface SeatDto {
  seatId: string;
  seatCode: string;
  status: string;
  type: string;
  deck: number;
  row: number;
  col: number;
}

// Matches TripSearchRequest.java
export interface TripSearchRequest {
  page?: number;
  limit?: number;
  origin?: string;
  destination?: string;
  date?: string; // YYYY-MM-DD
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

// Matches TripSearchResponse.java
export interface TripResponse {
  tripId: string; // Backend DTO uses 'tripId'
  route: {
    origin: string;
    destination: string;
    durationMinutes: number;
  };
  operator: {
    name: string;
  };
  bus: {
    model: string;
    type: string;
  };
  schedule: {
    departureTime: string;
    arrivalTime: string;
  };
  pricing: {
    basePrice: number;
    currency: string;
  };
  availability: {
    totalSeats: number;
    availableSeats: number;
  };
  status: TripStatus;
}

// Matches TripRequest.java (Payload for Create/Update)
export interface TripPayload {
  routeId: string;
  busId: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  status: TripStatus;
}
