import { useContext } from 'react';
import SocketContext from '@/context/SocketContext';
import type {
  SocketState,
  SeatUpdateEvent,
  BookingConfirmedEvent,
  TripStatusEvent,
  NotificationEvent,
} from '@/types/SocketTypes';

// --- CONTEXT VALUE INTERFACE ---
export interface SocketContextValue {
  // Connection state
  state: SocketState;

  // Connection controls
  connect: () => void;
  disconnect: () => void;

  // Room management
  joinTrip: (tripId: string) => void;
  leaveTrip: (tripId: string) => void;
  subscribeBooking: (ticketCode: string) => void;
  unsubscribeBooking: (ticketCode: string) => void;

  // Event subscriptions
  onSeatUpdate: (callback: (data: SeatUpdateEvent) => void) => () => void;
  onBookingConfirmed: (callback: (data: BookingConfirmedEvent) => void) => () => void;
  onTripStatus: (callback: (data: TripStatusEvent) => void) => () => void;
  onNotification: (callback: (data: NotificationEvent) => void) => () => void;
}

// --- CUSTOM HOOK ---
export const useSocketContext = (): SocketContextValue => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
