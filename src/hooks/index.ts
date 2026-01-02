// src/hooks/index.ts - Export all hooks for easier imports

// Auth hooks
export { useAuth } from './useAuth';

// Socket/Real-time hooks
export {
  useRealTimeSeats,
  useBookingConfirmation,
  useTripStatusUpdates,
  useSocketState,
  useSocketConnection,
} from './useSocket';

// Transaction hooks
export { useSeatTransaction } from './useSeatTransaction';

// Ticket hooks
export { useTicketLookup } from './useTicketLookup';
