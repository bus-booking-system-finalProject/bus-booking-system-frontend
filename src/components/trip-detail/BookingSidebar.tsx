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
} from '@mui/material';
import { DirectionsBus } from '@mui/icons-material';
import { type Trip, type Seat } from '@/types/trip';
import { useQuery } from '@tanstack/react-query';
import { getTripSeats } from '@/lib/api/trips';
import SeatMap from './SeatMap'; // Make sure this file exists in the same folder

const BookingSidebar: React.FC<{ trip: Trip }> = ({ trip }) => {
  // State for selected seats
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

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
              {error instanceof Error ? error.message : 'Không thể tải sơ đồ ghế.'}
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
          <Typography variant="body2" fontWeight={700} sx={{ maxWidth: '60%', textAlign: 'right' }}>
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
          onClick={() =>
            alert(`Đang đặt vé cho các ghế: ${selectedSeats.map((s) => s.seatCode).join(', ')}`)
          }
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
  );
};

export default BookingSidebar;
