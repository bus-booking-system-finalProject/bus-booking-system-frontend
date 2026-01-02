// src/types/SocketTypes.ts - Type definitions for Socket.IO events

// --- SEAT EVENTS ---
export type SeatStatusType = 'available' | 'locked' | 'booked';

export interface SeatUpdateEvent {
  tripId: string;
  seats: string[];
  status: SeatStatusType;
}

// --- BOOKING EVENTS ---
export interface BookingConfirmedEvent {
  ticketCode: string;
  status: 'CONFIRMED' | 'CANCELLED';
  tripId?: string;
  message?: string;
}

// --- TRIP STATUS EVENTS ---
export type TripStatusType = 'SCHEDULED' | 'DELAYED' | 'CANCELLED' | 'COMPLETED';

export interface TripStatusEvent {
  tripId: string;
  status: TripStatusType;
  delayMinutes?: number;
  message?: string;
  updatedAt: string;
}

// --- NOTIFICATION EVENTS ---
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationEvent {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

// --- SOCKET EVENT NAMES ---
export const SOCKET_EVENTS = {
  // Outgoing (Client -> Server)
  JOIN_TRIP: 'join_trip',
  LEAVE_TRIP: 'leave_trip',
  SUBSCRIBE_BOOKING: 'subscribe_booking',
  UNSUBSCRIBE_BOOKING: 'unsubscribe_booking',

  // Incoming (Server -> Client)
  SEAT_UPDATE: 'seat_update',
  BOOKING_CONFIRMED: 'booking_confirmed',
  TRIP_STATUS: 'trip_status',
  NOTIFICATION: 'notification',
} as const;

// --- SOCKET CONNECTION STATE ---
export type SocketConnectionState = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface SocketState {
  isConnected: boolean;
  connectionState: SocketConnectionState;
  socketId: string | null;
  lastError: string | null;
}
