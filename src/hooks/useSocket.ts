// src/hooks/useSocket.ts - Custom hooks for Socket.IO functionality
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketContext } from '@/context/SocketContext';
import type { SeatUpdateEvent, BookingConfirmedEvent, TripStatusEvent } from '@/types/SocketTypes';

/**
 * Hook to subscribe to real-time seat updates for a specific trip
 * Automatically invalidates the seat query when updates are received
 */
export const useRealTimeSeats = (tripId: string | null) => {
  const { connect, disconnect, joinTrip, leaveTrip, onSeatUpdate, state } = useSocketContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tripId) {
      // No tripId, ensure disconnected
      if (state.isConnected) {
        disconnect();
      }
      return;
    }

    // Connect if not connected
    if (!state.isConnected) {
      connect();
    }

    // Join the trip room once connected
    joinTrip(tripId);

    // Listen for seat updates
    const unsubscribe = onSeatUpdate((data: SeatUpdateEvent) => {
      if (data.tripId === tripId) {
        console.log('[useRealTimeSeats] Seat update received:', data);
        // Invalidate the seats query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ['trip-seats', tripId] });
      }
    });

    // Cleanup: leave room and unsubscribe
    return () => {
      leaveTrip(tripId);
      unsubscribe();
    };
  }, [
    tripId,
    connect,
    disconnect,
    joinTrip,
    leaveTrip,
    onSeatUpdate,
    queryClient,
    state.isConnected,
  ]);

  return {
    isConnected: state.isConnected,
    connectionState: state.connectionState,
  };
};

/**
 * Hook to subscribe to booking confirmation updates
 * Useful for the payment page to know when payment is successful
 */
export const useBookingConfirmation = (
  ticketCode: string | null,
  onConfirmed?: (data: BookingConfirmedEvent) => void,
) => {
  const { connect, subscribeBooking, unsubscribeBooking, onBookingConfirmed, state } =
    useSocketContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!ticketCode) return;

    // Ensure connection
    if (!state.isConnected) {
      connect();
    }

    // Subscribe to booking updates
    subscribeBooking(ticketCode);

    // Listen for confirmations
    const unsubscribe = onBookingConfirmed((data: BookingConfirmedEvent) => {
      if (data.ticketCode === ticketCode) {
        console.log('[useBookingConfirmation] Booking confirmed:', data);

        // Invalidate booking query to refresh data
        queryClient.invalidateQueries({ queryKey: ['booking', ticketCode] });

        // Call user callback
        onConfirmed?.(data);
      }
    });

    return () => {
      unsubscribeBooking(ticketCode);
      unsubscribe();
    };
  }, [
    ticketCode,
    connect,
    subscribeBooking,
    unsubscribeBooking,
    onBookingConfirmed,
    onConfirmed,
    queryClient,
    state.isConnected,
  ]);

  return {
    isConnected: state.isConnected,
  };
};

/**
 * Hook to subscribe to trip status updates
 * Useful for ticket history to show real-time trip status changes
 */
export const useTripStatusUpdates = (
  tripIds: string[],
  onStatusChange?: (data: TripStatusEvent) => void,
) => {
  const { connect, joinTrip, leaveTrip, onTripStatus, state } = useSocketContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (tripIds.length === 0) return;

    // Ensure connection
    if (!state.isConnected) {
      connect();
    }

    // Join all trip rooms
    tripIds.forEach((tripId) => joinTrip(tripId));

    // Listen for status updates
    const unsubscribe = onTripStatus((data: TripStatusEvent) => {
      if (tripIds.includes(data.tripId)) {
        console.log('[useTripStatusUpdates] Trip status update:', data);

        // Invalidate ticket history to refresh
        queryClient.invalidateQueries({ queryKey: ['my-tickets'] });

        // Call user callback
        onStatusChange?.(data);
      }
    });

    return () => {
      tripIds.forEach((tripId) => leaveTrip(tripId));
      unsubscribe();
    };
  }, [
    tripIds,
    connect,
    joinTrip,
    leaveTrip,
    onTripStatus,
    onStatusChange,
    queryClient,
    state.isConnected,
  ]);

  return {
    isConnected: state.isConnected,
  };
};

/**
 * Simple hook to check socket connection state
 */
export const useSocketState = () => {
  const { state } = useSocketContext();
  return state;
};

/**
 * Hook to manually control socket connection
 */
export const useSocketConnection = () => {
  const { connect, disconnect, state } = useSocketContext();

  const ensureConnected = useCallback(() => {
    if (!state.isConnected) {
      connect();
    }
  }, [connect, state.isConnected]);

  return {
    connect,
    disconnect,
    ensureConnected,
    isConnected: state.isConnected,
    connectionState: state.connectionState,
  };
};
