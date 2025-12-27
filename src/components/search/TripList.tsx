import React, { useState } from 'react';
import { Box, Stack, Pagination } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import TripCard from './TripCard';
import { getTripSeats } from '@/lib/api/trips';
import type { Trip, Seat } from '@/types/TripTypes';
import { useSeatTransaction } from '@/hooks/useSeatTransaction';

interface TripListProps {
  trips: Trip[];
  page: number;
  pageCount: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

const TripList: React.FC<TripListProps> = ({ trips, page, pageCount, onPageChange }) => {
  const navigate = useNavigate();

  // --- 1. VIEW STATE ---
  // Booking: Only one ID allowed (Single Active)
  const [bookingTripId, setBookingTripId] = useState<string | null>(null);
  // Details: Multiple IDs allowed
  const [openDetailsIds, setOpenDetailsIds] = useState<Set<string>>(new Set());

  // --- 2. BOOKING DATA STATE (Shared) ---
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [selectedPickup, setSelectedPickup] = useState<string>('');
  const [selectedDropoff, setSelectedDropoff] = useState<string>('');

  // --- 3. API HOOKS ---
  const { lock, unlock, isLocking } = useSeatTransaction({
    onLockSuccess: () => setActiveTab(1), // Auto-advance to next tab
    onLockError: (msg) => {
      alert(msg);
      setSelectedSeats([]); // Reset local selection on error
    },
  });

  // Fetch Seats (Only for the active booking trip)
  const {
    data: seatLayout,
    isLoading: isLoadingSeats,
    isError: isSeatError,
  } = useQuery({
    queryKey: ['trip-seats', bookingTripId],
    queryFn: () => (bookingTripId ? getTripSeats(bookingTripId) : Promise.resolve(null)),
    enabled: !!bookingTripId,
    staleTime: 1000 * 60 * 5,
  });

  // --- 4. LOGIC HELPERS ---

  // Reset booking form data
  const resetBookingData = () => {
    setSelectedSeats([]);
    setActiveTab(0);
    setSelectedPickup('');
    setSelectedDropoff('');
  };

  // --- 5. HANDLERS ---
  const handleBackToSeats = () => {
    if (bookingTripId) {
      // Unlock the seats on the server
      unlock(bookingTripId, selectedSeats);
      // Go back to tab 0 (Seats are kept in local state so user can modify them)
      setActiveTab(0);
    }
  };

  const handleToggleDetails = (tripId: string) => {
    // If opening Details while Booking is open for THIS trip, close Booking & Unlock
    if (bookingTripId === tripId) {
      unlock(bookingTripId, selectedSeats);
      setBookingTripId(null);
      resetBookingData();
    }

    // Toggle Details logic (allow multiple)
    setOpenDetailsIds((prev) => {
      const next = new Set(prev);
      if (next.has(tripId)) {
        next.delete(tripId);
      } else {
        next.add(tripId);
      }
      return next;
    });
  };

  const handleToggleBooking = (tripId: string) => {
    // 1. If switching AWAY from another booking, unlock the old one
    if (bookingTripId && bookingTripId !== tripId) {
      unlock(bookingTripId, selectedSeats);
    }

    if (bookingTripId === tripId) {
      // 2. CLOSING current booking
      unlock(bookingTripId, selectedSeats);
      setBookingTripId(null);
      resetBookingData();
    } else {
      // 3. OPENING new booking
      setBookingTripId(tripId);
      resetBookingData();

      // Enforce Mutual Exclusivity: Close Details for THIS trip if open
      setOpenDetailsIds((prev) => {
        const next = new Set(prev);
        if (next.has(tripId)) next.delete(tripId);
        return next;
      });
    }
  };

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seatId === seat.seatId);
      if (exists) return prev.filter((s) => s.seatId !== seat.seatId);
      if (prev.length >= 5) {
        alert('Bạn chỉ được chọn tối đa 5 ghế.');
        return prev;
      }
      return [...prev, seat];
    });
  };

  const handleContinue = (trip: Trip) => {
    if (activeTab === 0) {
      // Step 1: Lock Seats
      if (selectedSeats.length === 0) {
        alert('Vui lòng chọn ít nhất 1 ghế');
        return;
      }
      lock(trip.tripId, selectedSeats);
    } else {
      // Step 2: Navigate to Confirmation
      if (!selectedPickup || !selectedDropoff) {
        alert('Vui lòng chọn điểm đón và điểm trả');
        return;
      }
      navigate({
        to: '/booking/confirmation',
        state: {
          trip,
          selectedSeats,
          pickupId: selectedPickup,
          dropoffId: selectedDropoff,
          totalPrice: selectedSeats.reduce((sum, s) => sum + s.price, 0),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });
    }
  };

  return (
    <Box>
      {/* 1. TRIP CARDS */}
      <Stack spacing={2}>
        {trips.map((trip) => {
          const isBooking = bookingTripId === trip.tripId;
          const isDetails = openDetailsIds.has(trip.tripId);

          return (
            <TripCard
              key={trip.tripId}
              trip={trip}
              // View State
              isDetailsOpen={isDetails}
              isBookingOpen={isBooking}
              // Data State (Only pass relevant data if this card is booking)
              activeTab={isBooking ? activeTab : 0}
              selectedSeats={isBooking ? selectedSeats : []}
              selectedPickup={isBooking ? selectedPickup : ''}
              selectedDropoff={isBooking ? selectedDropoff : ''}
              // Query/Mutation Status
              seatLayout={isBooking ? seatLayout : null}
              isLoadingSeats={isBooking && isLoadingSeats}
              isSeatError={isBooking && isSeatError}
              isLocking={isBooking && isLocking}
              // Actions
              onToggleDetails={() => handleToggleDetails(trip.tripId)}
              onToggleBooking={() => handleToggleBooking(trip.tripId)}
              onSeatSelect={handleSeatSelect}
              onPickupChange={setSelectedPickup}
              onDropoffChange={setSelectedDropoff}
              onContinue={() => handleContinue(trip)}
              onBack={handleBackToSeats}
            />
          );
        })}
      </Stack>

      {/* 2. PAGINATION */}
      {pageCount > 1 && (
        <Stack alignItems="center" sx={{ mt: 4, mb: 4 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={onPageChange}
            color="primary"
            size="large"
            shape="rounded"
          />
        </Stack>
      )}
    </Box>
  );
};

export default TripList;
