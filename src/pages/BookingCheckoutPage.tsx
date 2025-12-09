import React from 'react';
import { useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Divider,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  AccessTime,
  DirectionsBus,
  CheckCircle,
  Person,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import { getBookingById } from '@/lib/api/trips';
import { bookingCheckoutRoute } from '@/routes/BookingCheckoutRoute';
import Header from '@/components/Header';

const BookingCheckoutPage: React.FC = () => {
  const { ticketId } = useSearch({ from: bookingCheckoutRoute.id });

  const {
    data: booking,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['booking', ticketId],
    queryFn: () => getBookingById(ticketId),
    enabled: !!ticketId,
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to calculate duration (e.g., "30h 15m")
  const calculateDuration = (start?: string, end?: string) => {
    if (!start || !end) return '';
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  };

  if (isLoading)
    return (
      <Box sx={{ p: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  if (isError || !booking) return <Alert severity="error">Không tìm thấy thông tin vé.</Alert>;

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', py: 4, pb: 10 }}>
      <Header />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => window.history.back()} sx={{ mb: 2 }}>
          Quay lại
        </Button>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          Thanh toán vé
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start">
          {/* LEFT: BOOKING SUCCESS & CUSTOMER INFO */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    Đặt chỗ thành công!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mã vé: <b>{booking.ticketCode}</b> • Trạng thái:{' '}
                    {booking.status === 'pending' ? 'Chờ thanh toán' : booking.status}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 3 }}>
                Thông tin liên hệ
              </Typography>

              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Person color="action" />
                  <Typography>{booking.contactName}</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Phone color="action" />
                  <Typography>{booking.contactPhone}</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Email color="action" />
                  <Typography>{booking.contactEmail}</Typography>
                </Stack>
              </Stack>
            </Paper>

            <Alert severity="info" icon={<DirectionsBus />}>
              Ghế của bạn đã được giữ. Vui lòng hoàn tất thanh toán trong vòng 10 phút để tránh bị
              hủy vé.
            </Alert>
          </Box>

          {/* RIGHT: TRIP SUMMARY & PAYMENT */}
          <Box sx={{ width: { xs: '100%', md: '400px' }, flexShrink: 0 }}>
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#fff', position: 'sticky', top: 24 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Chi tiết chuyến đi
              </Typography>
              <Divider sx={{ my: 2 }} />

              {booking.tripDetails && (
                <>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="primary.main"
                    gutterBottom
                  >
                    {booking.tripDetails.operator}
                  </Typography>

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <DirectionsBus fontSize="small" color="action" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {booking.tripDetails.route}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* 1. DEPARTURE (Đi) */}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">
                        Đi: {formatTime(booking.tripDetails.departureTime)} •{' '}
                        {formatDate(booking.tripDetails.departureTime)}
                      </Typography>
                    </Stack>

                    {/* 2. ARRIVAL (Đến) - NEW */}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2">
                        Đến: {formatTime(booking.tripDetails.arrivalTime)} •{' '}
                        {formatDate(booking.tripDetails.arrivalTime)}
                      </Typography>
                    </Stack>

                    {/* 3. DURATION (Thời gian) - CHANGED */}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2">
                        Thời gian:{' '}
                        {calculateDuration(
                          booking.tripDetails.departureTime,
                          booking.tripDetails.arrivalTime,
                        )}
                      </Typography>
                    </Stack>
                  </Stack>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography color="text.secondary">Ghế:</Typography>
                <Typography fontWeight={700} color="primary.main">
                  {booking.seats.join(', ')}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography color="text.secondary">Số lượng:</Typography>
                <Typography fontWeight={700}>{booking.seats.length} vé</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography color="text.secondary">Tổng tiền:</Typography>
                <Typography fontWeight={700}>{formatCurrency(booking.pricing.total)}</Typography>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3 }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Thanh toán
                </Typography>
                <Typography variant="h5" fontWeight={700} color="secondary.main">
                  {formatCurrency(booking.pricing.total)}
                </Typography>
              </Stack>

              <Button
                variant="contained"
                size="large"
                fullWidth
                sx={{ bgcolor: '#FFC107', color: 'black', fontWeight: 700, py: 1.5 }}
                onClick={() => alert('Chuyển đến cổng thanh toán VNPay/Momo...')}
              >
                Thanh toán ngay
              </Button>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default BookingCheckoutPage;
