// src/context/SocketContext.tsx - Global Socket.IO Context Provider
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { socket, socketEvents, connectSocket, disconnectSocket } from '@/lib/utils/socket';
import type {
  SocketState,
  SeatUpdateEvent,
  BookingConfirmedEvent,
  TripStatusEvent,
  NotificationEvent,
} from '@/types/SocketTypes';

// --- CONTEXT VALUE INTERFACE ---
interface SocketContextValue {
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

// --- CREATE CONTEXT ---
const SocketContext = createContext<SocketContextValue | null>(null);

// --- PROVIDER COMPONENT ---
interface SocketProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  autoConnect = false,
}) => {
  // Track connection state
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    connectionState: 'disconnected',
    socketId: null,
    lastError: null,
  });

  // Track joined rooms to rejoin on reconnect
  const joinedTrips = useRef<Set<string>>(new Set());
  const subscribedBookings = useRef<Set<string>>(new Set());

  // --- CONNECTION HANDLERS ---
  useEffect(() => {
    const handleConnect = () => {
      console.log('[SocketContext] Connected:', socket.id);
      setState({
        isConnected: true,
        connectionState: 'connected',
        socketId: socket.id ?? null,
        lastError: null,
      });

      // Rejoin rooms after reconnection
      joinedTrips.current.forEach((tripId) => {
        socketEvents.joinTrip(tripId);
      });
      subscribedBookings.current.forEach((ticketCode) => {
        socketEvents.subscribeBooking(ticketCode);
      });
    };

    const handleDisconnect = (reason: string) => {
      console.log('[SocketContext] Disconnected:', reason);
      setState((prev) => ({
        ...prev,
        isConnected: false,
        connectionState: 'disconnected',
        socketId: null,
      }));
    };

    const handleConnectError = (error: Error) => {
      console.error('[SocketContext] Connection error:', error.message);
      setState((prev) => ({
        ...prev,
        isConnected: false,
        connectionState: 'error',
        lastError: error.message,
      }));
    };

    // Register listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Auto-connect if enabled
    if (autoConnect) {
      connectSocket();
    }

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [autoConnect]);

  // --- ROOM MANAGEMENT ---
  const joinTrip = useCallback((tripId: string) => {
    joinedTrips.current.add(tripId);
    if (socket.connected) {
      socketEvents.joinTrip(tripId, () => {
        console.log('[SocketContext] Joined trip room:', tripId);
      });
    }
  }, []);

  const leaveTrip = useCallback((tripId: string) => {
    joinedTrips.current.delete(tripId);
    if (socket.connected) {
      socketEvents.leaveTrip(tripId);
      console.log('[SocketContext] Left trip room:', tripId);
    }
  }, []);

  const subscribeBooking = useCallback((ticketCode: string) => {
    subscribedBookings.current.add(ticketCode);
    if (socket.connected) {
      socketEvents.subscribeBooking(ticketCode);
      console.log('[SocketContext] Subscribed to booking:', ticketCode);
    }
  }, []);

  const unsubscribeBooking = useCallback((ticketCode: string) => {
    subscribedBookings.current.delete(ticketCode);
    if (socket.connected) {
      socketEvents.unsubscribeBooking(ticketCode);
      console.log('[SocketContext] Unsubscribed from booking:', ticketCode);
    }
  }, []);

  // --- CONNECTION CONTROLS ---
  const connect = useCallback(() => {
    setState((prev) => ({ ...prev, connectionState: 'connecting' }));
    connectSocket();
  }, []);

  const disconnect = useCallback(() => {
    joinedTrips.current.clear();
    subscribedBookings.current.clear();
    disconnectSocket();
  }, []);

  // --- CONTEXT VALUE ---
  const value: SocketContextValue = {
    state,
    connect,
    disconnect,
    joinTrip,
    leaveTrip,
    subscribeBooking,
    unsubscribeBooking,
    onSeatUpdate: socketEvents.onSeatUpdate,
    onBookingConfirmed: socketEvents.onBookingConfirmed,
    onTripStatus: socketEvents.onTripStatus,
    onNotification: socketEvents.onNotification,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

// --- CUSTOM HOOK ---
export const useSocketContext = (): SocketContextValue => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
