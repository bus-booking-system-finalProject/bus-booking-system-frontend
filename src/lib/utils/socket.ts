import { io, Socket } from 'socket.io-client';
import type {
  SeatUpdateEvent,
  BookingConfirmedEvent,
  TripStatusEvent,
  NotificationEvent,
} from '@/types/SocketTypes';

// Use the same API URL as REST requests - connect through the API Gateway
// The gateway will handle the WebSocket upgrade and routing
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

console.log('[Socket] Initializing with URL:', SOCKET_URL);
console.log('[Socket] WebSocket path: /socket.io/');

// --- SOCKET INSTANCE ---
export const socket: Socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  path: '/socket.io/',
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  timeout: 60000, // Increased timeout for gateway handshake
});

// --- EVENT CALLBACK TYPES ---
export type SeatUpdateCallback = (data: SeatUpdateEvent) => void;
export type BookingConfirmedCallback = (data: BookingConfirmedEvent) => void;
export type TripStatusCallback = (data: TripStatusEvent) => void;
export type NotificationCallback = (data: NotificationEvent) => void;

// --- SOCKET EVENT HELPERS ---
export const socketEvents = {
  // Join a trip room for real-time seat updates
  joinTrip: (tripId: string, callback?: () => void) => {
    socket.emit('join_trip', tripId, callback);
  },

  // Leave a trip room
  leaveTrip: (tripId: string) => {
    socket.emit('leave_trip', tripId);
  },

  // Subscribe to booking updates for a specific ticket
  subscribeBooking: (ticketCode: string) => {
    socket.emit('subscribe_booking', ticketCode);
  },

  // Unsubscribe from booking updates
  unsubscribeBooking: (ticketCode: string) => {
    socket.emit('unsubscribe_booking', ticketCode);
  },

  // --- EVENT LISTENERS ---
  onSeatUpdate: (callback: SeatUpdateCallback) => {
    socket.on('seat_update', callback);
    return () => socket.off('seat_update', callback);
  },

  onBookingConfirmed: (callback: BookingConfirmedCallback) => {
    socket.on('booking_confirmed', callback);
    return () => socket.off('booking_confirmed', callback);
  },

  onTripStatus: (callback: TripStatusCallback) => {
    socket.on('trip_status', callback);
    return () => socket.off('trip_status', callback);
  },

  onNotification: (callback: NotificationCallback) => {
    socket.on('notification', callback);
    return () => socket.off('notification', callback);
  },
};

// --- DEBUG LISTENERS (Development only) ---
if (import.meta.env.DEV) {
  socket.on('connect', () => {
    console.log('[Socket] Connected with ID:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (error: Error) => {
    console.error('[Socket] Connection error:', error);
    console.error('[Socket] Error message:', error?.message);
  });

  socket.on('error', (error) => {
    console.error('[Socket] Error:', error);
  });
}

// --- UTILITY FUNCTIONS ---
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const isSocketConnected = () => socket.connected;
