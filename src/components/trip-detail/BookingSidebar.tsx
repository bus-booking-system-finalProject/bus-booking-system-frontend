import React, { useState, useMemo, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Close, AccessTime } from '@mui/icons-material';
import { type Trip, type Seat } from '@/types/TripTypes'; // Ensure this path matches your file structure (e.g., '@/types/trip')
import { useQuery, useMutation } from '@tanstack/react-query';
import { getTripSeats, createBooking, lockSeats, unlockSeats } from '@/lib/api/trips';
import { useNavigate } from '@tanstack/react-router';
import SeatMap from '../search/SeatMap';
import { useAuth } from '@/hooks/useAuth';
import { AxiosError } from 'axios';
import { getSessionId } from '@/utils/session';

interface ApiErrorResponse {
  success: boolean;
  message: string;
}

interface BookingSidebarProps {
  trip: Trip;
  selectedPickupId: string | null;
  selectedDropoffId: string | null;
  bookingDisabled: boolean;
}

const BookingSidebar: React.FC<BookingSidebarProps> = ({
  trip,
  selectedPickupId,
  selectedDropoffId,
  bookingDisabled,
}) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // State
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  // State for Countdown Timer
  const [lockExpirationTime, setLockExpirationTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // 1. Fetch Seats
  const {
    data: seatLayout,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['trip-seats', trip.tripId],
    queryFn: () => getTripSeats(trip.tripId),
    enabled: !!trip.tripId,
    retry: 1,
  });

  // --- MUTATION 1: LOCK SEATS (First Step) ---
  const lockMutation = useMutation({
    mutationFn: lockSeats,
    onSuccess: () => {
      // 1. Set expiration time (Current time + 10 minutes)
      const expiresAt = Date.now() + 10 * 60 * 1000;
      setLockExpirationTime(expiresAt);

      // 2. Open the popup to enter info
      setOpenDialog(true);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error.response?.data?.message || 'Không thể giữ ghế. Vui lòng thử lại.';
      alert(msg);
    },
  });

  // --- MUTATION 2: UNLOCK SEATS (Cleanup) ---
  const unlockMutation = useMutation({
    mutationFn: unlockSeats,
    onError: (error) => {
      console.error('Failed to unlock seats:', error);
    },
  });

  // --- MUTATION 3: CREATE BOOKING (Third Step) ---
  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      navigate({
        to: '/booking/checkout',
        search: { ticketId: data.ticketId } as { ticketId: string },
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error.response?.data?.message || 'Đặt vé thất bại. Vui lòng thử lại.';
      alert(msg);
    },
  });

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (!openDialog || !lockExpirationTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = lockExpirationTime - now;
      setTimeLeft(diff > 0 ? diff : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [openDialog, lockExpirationTime]);

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- HANDLERS ---

  const handleSeatToggle = (seat: Seat) => {
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

  // Step 1: Click "Tiếp tục" -> Call Lock API
  const handleContinueClick = () => {
    // FIX 1: Enforce bookingDisabled check here
    if (bookingDisabled) {
      alert('Vui lòng chọn điểm đón và trả khách trước.');
      return;
    }
    if (selectedSeats.length === 0) return;

    const sessionId = getSessionId();
    const seatCodes = selectedSeats.map((s) => s.seatCode);

    lockMutation.mutate({
      tripId: trip.tripId,
      seats: seatCodes,
      sessionId: sessionId,
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setLockExpirationTime(null);

    if (selectedSeats.length > 0) {
      const sessionId = getSessionId();
      const seatCodes = selectedSeats.map((s) => s.seatCode);

      unlockMutation.mutate({
        tripId: trip.tripId,
        seats: seatCodes,
        sessionId: sessionId,
      });
    }
  };

  // Step 2: Click "Xác nhận" -> Call Booking API
  const handleSubmitBooking = () => {
    if (!formData.name || !formData.phone || !formData.email) {
      alert('Vui lòng điền đầy đủ thông tin liên hệ.');
      return;
    }

    // Safety check for Pickup/Dropoff
    if (!selectedPickupId || !selectedDropoffId) {
      alert('Thiếu thông tin điểm đón/trả.');
      return;
    }

    if (timeLeft <= 0) {
      alert('Thời gian giữ ghế đã hết. Vui lòng chọn lại.');
      setOpenDialog(false);
      window.location.reload();
      return;
    }

    const sessionId = getSessionId();
    const seatCodes = selectedSeats.map((s) => s.seatCode);
    const isGuest = !isLoggedIn;

    bookingMutation.mutate({
      tripId: trip.tripId,
      seats: seatCodes,
      contactName: formData.name,
      contactEmail: formData.email,
      contactPhone: formData.phone,
      isGuestCheckout: isGuest,
      sessionId: sessionId,
      pickupId: selectedPickupId,
      dropoffId: selectedDropoffId,
    });
  };

  const totalPrice = useMemo(
    () => selectedSeats.reduce((sum, s) => sum + s.price, 0),
    [selectedSeats],
  );
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  const availableCount = seatLayout?.seats?.filter((s) => s.status === 'available').length || 0;

  return (
    <>
      <Paper
        elevation={4}
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: 'white',
          position: 'sticky',
          top: 24,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 40px)',
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Chọn ghế
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={2} sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary" variant="body2">
              Trạng thái xe
            </Typography>
            <Chip label="Đang mở bán" color="success" size="small" variant="filled" />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary" variant="body2">
              Chỗ trống
            </Typography>
            <Typography fontWeight={700} color={availableCount < 5 ? 'error.main' : 'success.main'}>
              {availableCount} / {seatLayout?.seats?.length || 0} ghế
            </Typography>
          </Stack>
        </Stack>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 250,
            mb: 2,
            bgcolor: '#f8f9fa',
            borderRadius: 2,
            p: 1,
            display: 'flex',
            justifyContent: isLoading ? 'center' : 'flex-start',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {isLoading ? (
            <CircularProgress />
          ) : isError ? (
            <Alert severity="error">Lỗi tải ghế</Alert>
          ) : (
            <SeatMap
              layout={seatLayout!}
              selectedSeats={selectedSeats}
              onSeatToggle={handleSeatToggle}
            />
          )}
        </Box>

        <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f0f0f0' }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Ghế đã chọn:
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {selectedSeats.length > 0
                ? selectedSeats.map((s) => s.seatCode).join(', ')
                : 'Chưa chọn'}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight={600}>
              Tổng cộng:
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {formatCurrency(totalPrice)}
            </Typography>
          </Stack>

          <Button
            variant="contained"
            fullWidth
            size="large"
            // FIX 3: Disable button if booking is disabled (no pickup/dropoff selected)
            disabled={selectedSeats.length === 0 || lockMutation.isPending || bookingDisabled}
            sx={{ bgcolor: '#FFC107', color: 'black', fontWeight: 700, py: 1.5 }}
            onClick={handleContinueClick}
          >
            {lockMutation.isPending
              ? 'Đang giữ ghế...'
              : bookingDisabled
                ? 'Chọn điểm đón/trả'
                : selectedSeats.length === 0
                  ? 'Vui lòng chọn ghế'
                  : 'Tiếp tục'}
          </Button>
        </Box>
      </Paper>

      {/* --- POPUP DIALOG --- */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6" component="div" fontWeight={700}>
            Xác nhận thông tin
          </Typography>
          <Button size="small" onClick={handleCloseDialog} sx={{ minWidth: 0, p: 0.5 }}>
            <Close />
          </Button>
        </DialogTitle>

        <DialogContent dividers>
          <Alert severity="warning" icon={<AccessTime />} sx={{ mb: 3, alignItems: 'center' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
              <Typography variant="body2">Hoàn tất trong:</Typography>
              <Typography variant="h6" component="div" fontWeight={700} color="warning.dark">
                {formatCountdown(timeLeft)}
              </Typography>
            </Stack>
          </Alert>

          <Stack spacing={2.5}>
            {!isLoggedIn && (
              <Alert severity="info">
                Bạn đang đặt vé với tư cách là <b>Khách</b>.
              </Alert>
            )}

            <TextField
              label="Họ và tên"
              fullWidth
              size="small"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Số điện thoại"
              fullWidth
              size="small"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              label="Email nhận vé"
              fullWidth
              size="small"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Typography variant="caption" color="text.secondary">
              *Thông tin này sẽ được dùng để gửi vé điện tử.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleSubmitBooking}
            variant="contained"
            disabled={bookingMutation.isPending || timeLeft === 0}
            sx={{ bgcolor: '#FFC107', color: 'black', fontWeight: 700, px: 3 }}
          >
            {bookingMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đặt vé'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookingSidebar;
