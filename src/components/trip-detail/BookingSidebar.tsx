import React, { useState, useMemo } from 'react';
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
import { DirectionsBus, Close } from '@mui/icons-material';
import { type Trip, type Seat } from '@/types/trip';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getTripSeats, createBooking } from '@/lib/api/trips';
import { useNavigate } from '@tanstack/react-router';
import SeatMap from './SeatMap';
import { useAuth } from '@/hooks/useAuth';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  success: boolean;
  message: string;
}

const BookingSidebar: React.FC<{ trip: Trip }> = ({ trip }) => {
  const navigate = useNavigate();
  // State for selected seats
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const { user, isLoggedIn, accessToken } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // 1. Fetch Seat Data
  const {
    data: seatLayout,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['trip-seats', trip.tripId],
    queryFn: () => getTripSeats(trip.tripId),
    enabled: !!trip.tripId, // Only fetch if ID exists
    retry: 1, // Don't retry forever if it fails
  });

  // 3. Setup Mutation for Locking Seats
  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      // Navigate to Checkout Page with the new Ticket ID
      navigate({
        to: '/booking/checkout',
        search: {
          ticketId: data.ticketId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any, // Cast is needed until you update BookingCheckoutRoute schema
      });
    },
    // FIX: Use generic AxiosError<ApiErrorResponse> instead of 'any'
    onError: (error: AxiosError<ApiErrorResponse>) => {
      console.error(error);

      // Now TypeScript knows 'error.response' has a specific shape
      if (error.response?.status === 401) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else {
        // Safe access to .data.message
        const msg = error.response?.data?.message || 'Không thể giữ ghế. Vui lòng thử lại.';
        alert(msg);
      }
    },
  });

  // 2. Handle Seat Toggle
  const handleSeatToggle = (seat: Seat) => {
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seatId === seat.seatId);
      if (exists) {
        return prev.filter((s) => s.seatId !== seat.seatId);
      } else {
        if (prev.length >= 5) {
          alert('Bạn chỉ được chọn tối đa 5 ghế.');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  // 3. Handle "Continue" Click -> OPEN DIALOG
  const handleOpenConfirmDialog = () => {
    if (selectedSeats.length === 0) return;

    if (!isLoggedIn || !accessToken || !user) {
      alert('Bạn cần đăng nhập để đặt vé.');
      return;
    }

    // Pre-fill form with user data from Auth Context
    setFormData({
      name: '',
      email: '',
      phone: '',
    });

    setOpenDialog(true);
  };

  // 4. Handle "Confirm" inside Dialog -> CALL API
  const handleSubmitBooking = () => {
    const seatCodes = selectedSeats.map((s) => s.seatCode);

    mutation.mutate({
      tripId: trip.tripId,
      seats: seatCodes,
      contactName: formData.name,
      contactEmail: formData.email,
      contactPhone: formData.phone,
      isGuestCheckout: false,
    });
  };

  // 3. Calculate Total
  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // 4. Calculate Seat Status counts
  const availableCount = seatLayout?.seats?.filter((s) => s.status === 'available').length || 0;
  const totalCount = seatLayout?.seats?.length || 0;

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
          border: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 40px)', // Limit height
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Chọn ghế
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={2} sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography color="text.secondary" variant="body2">
              Trạng thái xe
            </Typography>
            <Chip
              label="Đang mở bán"
              color="success"
              size="small"
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography color="text.secondary" variant="body2">
              Chỗ trống
            </Typography>
            <Typography fontWeight={700} color={availableCount < 5 ? 'error.main' : 'success.main'}>
              {availableCount} / {totalCount} ghế
            </Typography>
          </Stack>
        </Stack>

        {/* --- SEAT MAP AREA --- */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 250,
            mb: 2,
            bgcolor: '#f8f9fa',
            borderRadius: 2,
            border: '1px solid #eee',
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: isLoading ? 'center' : 'flex-start',
          }}
        >
          {isLoading ? (
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={30} />
              <Typography variant="caption" color="text.secondary">
                Đang tải sơ đồ...
              </Typography>
            </Stack>
          ) : isError ? (
            <Stack alignItems="center" spacing={1} sx={{ p: 2, textAlign: 'center' }}>
              <Alert severity="error" sx={{ width: '100%', fontSize: '0.8rem' }}>
                Không thể tải sơ đồ ghế.
              </Alert>
              <Button size="small" onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            </Stack>
          ) : seatLayout ? (
            <SeatMap
              layout={seatLayout}
              selectedSeats={selectedSeats}
              onSeatToggle={handleSeatToggle}
            />
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <DirectionsBus sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Chưa có dữ liệu ghế.
              </Typography>
            </Box>
          )}
        </Box>

        {/* --- FOOTER SUMMARY --- */}
        <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f0f0f0' }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Ghế đã chọn:
            </Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ maxWidth: '60%', textAlign: 'right' }}
            >
              {selectedSeats.length > 0
                ? selectedSeats.map((s) => s.seatCode).join(', ')
                : 'Chưa chọn'}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight={600}>
              Tổng cộng:
            </Typography>
            <Stack alignItems="flex-end">
              <Typography variant="h6" fontWeight={700} color="primary.main">
                {formatCurrency(totalPrice)}
              </Typography>
              {selectedSeats.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {selectedSeats.length} vé
                </Typography>
              )}
            </Stack>
          </Stack>

          <Button
            variant="contained"
            fullWidth
            size="large"
            disabled={selectedSeats.length === 0}
            sx={{
              bgcolor: '#FFC107',
              color: 'black',
              fontWeight: 700,
              textTransform: 'none',
              py: 1.5,
              fontSize: '1rem',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#ffca2c' },
              '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' },
            }}
            onClick={handleOpenConfirmDialog}
          >
            {selectedSeats.length === 0 ? 'Vui lòng chọn ghế' : 'Tiếp tục'}
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 2 }}
          >
            Hủy miễn phí trước 24h giờ đi
          </Typography>
        </Box>
      </Paper>

      {/* --- CONFIRMATION DIALOG (POPUP) --- */}
      <Dialog
        open={openDialog}
        onClose={() => !mutation.isPending && setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6" fontWeight={700}>
            Xác nhận thông tin
          </Typography>
          <Button
            size="small"
            onClick={() => setOpenDialog(false)}
            disabled={mutation.isPending}
            sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }}
          >
            <Close />
          </Button>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
              Bạn đang đặt {selectedSeats.length} vé:{' '}
              <b>{selectedSeats.map((s) => s.seatCode).join(', ')}</b>
            </Alert>

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
          <Button
            onClick={() => setOpenDialog(false)}
            disabled={mutation.isPending}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmitBooking}
            variant="contained"
            disabled={mutation.isPending}
            sx={{
              bgcolor: '#FFC107',
              color: 'black',
              fontWeight: 700,
              px: 3,
            }}
          >
            {mutation.isPending ? 'Đang xử lý...' : 'Xác nhận đặt vé'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookingSidebar;
