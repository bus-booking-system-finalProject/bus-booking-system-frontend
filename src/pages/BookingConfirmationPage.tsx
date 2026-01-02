// src/pages/BookingConfirmationPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Stack,
} from '@mui/material';
import { InfoOutlined, ArrowBack } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

// Utils & API
import { formatCurrency, formatTime } from '@/lib/utils/format';
import { createBooking, unlockSeats } from '@/lib/api/TicketsApi';
import { getSessionId } from '@/utils/session';
import type { Seat, StopPoint, Trip } from '@/types/TripTypes';
import type { ApiErrorResponse } from '@/types/CommonTypes'; // Import ApiErrorResponse
import { useAuth } from '@/hooks/useAuth';

export interface BookingConfirmationState {
  trip: Trip;
  selectedSeats: Seat[];
  pickupId: string;
  dropoffId: string;
  totalPrice: number;
}

export const BookingConfirmationPage = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const state = location.state as unknown as BookingConfirmationState;

  const { trip, selectedSeats, pickupId, dropoffId, totalPrice } = state || {};

  // Track success to prevent auto-unlocking when navigating to payment
  const isBookingSuccess = useRef(false);
  const { isLoggedIn } = useAuth();
  const sessionId = getSessionId();
  const seatCodes = selectedSeats?.map((s: Seat) => s.seatCode) ?? [];
  const isGuest = !isLoggedIn;

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    note: '',
  });

  // --- 1. API MUTATIONS (must be before any early returns) ---

  // Mutation to Unlock Seats (used when canceling/going back)
  const unlockMutation = useMutation({
    mutationFn: unlockSeats,
    onError: (err) => console.error('Unlock failed', err),
  });

  // Mutation to Create Ticket
  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      // Mark as success so cleanup useEffect doesn't trigger
      isBookingSuccess.current = true;

      // Navigate to Payment Page with booking details
      navigate({
        to: '/booking/payment',
        search: {
          ticketId: data.ticketId,
        } as { ticketId: string },
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error.response?.data?.message || 'Không thể tạo vé. Vui lòng thử lại.';
      alert(msg);
    },
  });

  // Handle Browser Back Button / Tab Close (Cleanup)
  // Use refs to access latest values without causing effect re-runs
  const tripRef = useRef(trip);
  const selectedSeatsRef = useRef(selectedSeats);

  useEffect(() => {
    tripRef.current = trip;
    selectedSeatsRef.current = selectedSeats;
  }, [trip, selectedSeats]);

  useEffect(() => {
    return () => {
      // If component unmounts and booking was NOT successful, release the seats
      const currentTrip = tripRef.current;
      const currentSeats = selectedSeatsRef.current;
      if (!isBookingSuccess.current && currentTrip && currentSeats?.length > 0) {
        unlockSeats({
          tripId: currentTrip.tripId,
          seats: currentSeats.map((s: Seat) => s.seatCode),
          sessionId: getSessionId(),
        }).catch((err) => console.error('Auto-unlock failed', err));
      }
    };
  }, []); // Empty deps - only run cleanup on actual unmount

  // Early return if accessed without proper state (AFTER all hooks)
  if (!trip || !selectedSeats || selectedSeats.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" color="error" textAlign="center">
          Không có thông tin đặt vé. Vui lòng quay lại trang tìm kiếm.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" onClick={() => navigate({ to: '/' })}>
            Quay lại trang chủ
          </Button>
        </Box>
      </Container>
    );
  }

  // --- 2. HANDLERS ---

  // Handle explicit "Quay lại" (Back) button click
  const handleBack = () => {
    if (trip && selectedSeats && selectedSeats.length > 0) {
      // Unlock seats immediately
      unlockMutation.mutate({
        tripId: trip.tripId,
        seats: selectedSeats.map((s: Seat) => s.seatCode),
        sessionId: getSessionId(),
      });
    }
    // Navigate back to the Trip List
    window.history.back();
  };

  const handleSubmit = () => {
    if (!formData.fullName || !formData.phone) {
      alert('Vui lòng nhập tên và số điện thoại');
      return;
    }

    createBookingMutation.mutate({
      tripId: trip.tripId,
      seats: seatCodes,
      contactName: formData.fullName,
      contactPhone: formData.phone,
      contactEmail: formData.email,
      sessionId: sessionId,
      isGuestCheckout: isGuest,
      pickupId,
      dropoffId,
    });
  };

  if (!trip) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Không tìm thấy thông tin chuyến đi.</Typography>
        <Button onClick={() => navigate({ to: '/' })}>Về trang chủ</Button>
      </Container>
    );
  }

  const pickupPoint = trip.route.pickup_points.find((p: StopPoint) => p.stopId === pickupId);
  const dropoffPoint = trip.route.dropoff_points.find((p: StopPoint) => p.stopId === dropoffId);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Back Button */}
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          disabled={createBookingMutation.isPending}
          color="primary"
        >
          Quay lại
        </Button>
      </Stack>

      {/* Main Grid Container */}
      <Grid container spacing={3}>
        {/* Left Column: Passenger Info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" mb={2} sx={{ borderLeft: '4px solid #1976d2', pl: 1 }}>
              Thông tin hành khách
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Họ và tên *"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={createBookingMutation.isPending}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Số điện thoại *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={createBookingMutation.isPending}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={createBookingMutation.isPending}
                />
              </Grid>

              {/* Info Alert Box */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: '#e3f2fd',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    border: '1px solid #bbdefb',
                    width: '100%',
                  }}
                >
                  <InfoOutlined sx={{ fontSize: 22, color: '#1565c0' }} />
                  <Typography variant="body2" sx={{ color: '#0d47a1', fontWeight: 600 }}>
                    Thông tin này sẽ được dùng để gửi vé điện tử.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              sx={{ py: 1.5 }}
              onClick={handleBack}
              disabled={createBookingMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{ py: 1.5 }}
              onClick={handleSubmit}
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Tiếp tục thanh toán'
              )}
            </Button>
          </Stack>
        </Grid>

        {/* Right Column: Trip Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Chi tiết chuyến đi
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" color="primary" fontWeight="bold">
              {trip.operator.name}
            </Typography>
            <Typography variant="body2" mb={2}>
              {trip.route.name}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                Điểm đón:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatTime(pickupPoint?.time)} - {pickupPoint?.name}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {pickupPoint?.address}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                Điểm trả:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatTime(dropoffPoint?.time)} - {dropoffPoint?.name}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {dropoffPoint?.address}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Số ghế:</Typography>
              <Typography fontWeight="bold">
                {selectedSeats?.length ?? 0} ({seatCodes.join(', ')})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="h6">Tổng cộng:</Typography>
              <Typography variant="h6" color="error">
                {formatCurrency(totalPrice)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
