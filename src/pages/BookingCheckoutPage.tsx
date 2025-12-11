import React, { useState, useEffect, useMemo } from 'react';
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
  Cancel,
  Person,
  Phone,
  Email,
  LocationOn,
  Timer,
} from '@mui/icons-material';
import { getBookingById } from '@/lib/api/trips';
import { bookingCheckoutRoute } from '@/routes/BookingCheckoutRoute';
import Header from '@/components/layout/Header';

const BookingCheckoutPage: React.FC = () => {
  const { ticketId } = useSearch({ from: bookingCheckoutRoute.id });

  // 1. STATE: We only track "now". We don't track "timeLeft" in state anymore.
  const [now, setNow] = useState(0);

  const {
    data: booking,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['booking', ticketId],
    queryFn: () => getBookingById(ticketId),
    enabled: !!ticketId,
  });

  // 2. EFFECT: Just keeps the clock ticking. No complex logic here.
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 3. DERIVED STATE: Calculate Expiration and TimeLeft during render.
  // This solves the "Cascading Render" error because we don't setState here.
  const expirationTime = useMemo(() => {
    if (booking?.status === 'pending' && booking.createdAt) {
      let dateStr = booking.createdAt;
      // Timezone fix
      if (!dateStr.endsWith('Z') && !dateStr.includes('+')) {
        dateStr += 'Z';
      }
      const createdTime = new Date(dateStr).getTime();
      return createdTime + 10 * 60 * 1000; // + 10 minutes
    }
    return null;
  }, [booking]);

  // Calculate milliseconds left (Derived immediately, no waiting for useEffect)
  const msLeft = expirationTime ? expirationTime - now : 0;
  const timeLeft = msLeft > 0 ? msLeft : 0;

  // --- Formatters ---
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
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (start?: string, end?: string) => {
    if (!start || !end) return '';
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  };

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLoading)
    return (
      <Box sx={{ p: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );

  if (isError || !booking) return <Alert severity="error">Không tìm thấy thông tin vé.</Alert>;

  // Determine Logic
  const isCancelled = booking.status === 'cancelled';
  // Check if expired based on our derived calculation
  const isExpired = timeLeft === 0 && booking.status === 'pending';

  const isInteractionDisabled = isCancelled || isExpired;

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 10 }}>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => window.history.back()} sx={{ mb: 2 }}>
          Quay lại
        </Button>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Thanh toán vé
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start">
          {/* LEFT: STATUS & INFO */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              {/* Status Header */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                {isCancelled ? (
                  <Cancel color="error" sx={{ fontSize: 40 }} />
                ) : (
                  <CheckCircle color="success" sx={{ fontSize: 40 }} />
                )}

                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={isCancelled ? 'error.main' : 'success.main'}
                  >
                    {isCancelled ? 'Vé đã bị hủy' : 'Đặt chỗ thành công!'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mã vé: <b>{booking.ticketCode}</b> • Trạng thái:{' '}
                    <span
                      style={{
                        color: isCancelled ? '#d32f2f' : '#2e7d32',
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                      }}
                    >
                      {isCancelled ? 'Đã hủy' : 'Chờ thanh toán'}
                    </span>
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

            {/* Alert / Countdown Area */}
            {isCancelled ? (
              <Alert severity="error" icon={<Cancel />}>
                Vé này đã bị hủy do người dùng hủy hoặc quá hạn thanh toán.
              </Alert>
            ) : (
              <Alert
                severity="warning"
                icon={<Timer />}
                sx={{
                  '& .MuiAlert-message': { width: '100%' },
                  bgcolor: isExpired ? '#fff3e0' : undefined,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                >
                  <Typography variant="body2">
                    {isExpired
                      ? 'Đã hết thời gian giữ ghế. Vui lòng đặt vé lại.'
                      : 'Vui lòng hoàn tất thanh toán để giữ ghế.'}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="warning.dark">
                    {formatCountdown(timeLeft)}
                  </Typography>
                </Stack>
              </Alert>
            )}
          </Box>

          {/* RIGHT: TRIP SUMMARY & CHECKOUT */}
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
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">
                        Đi: {formatTime(booking.tripDetails.departureTime)} •{' '}
                        {formatDate(booking.tripDetails.departureTime)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2">
                        Đến: {formatTime(booking.tripDetails.arrivalTime)} •{' '}
                        {formatDate(booking.tripDetails.arrivalTime)}
                      </Typography>
                    </Stack>
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

              {/* ACTION BUTTON */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={isInteractionDisabled}
                sx={{
                  bgcolor: isInteractionDisabled ? '#e0e0e0' : '#FFC107',
                  color: isInteractionDisabled ? '#9e9e9e' : 'black',
                  fontWeight: 700,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: isInteractionDisabled ? '#e0e0e0' : '#ffb300',
                  },
                }}
                onClick={() => alert('Chuyển đến cổng thanh toán VNPay/Momo...')}
              >
                {isCancelled ? 'Vé đã hủy' : isExpired ? 'Hết thời gian giữ vé' : 'Thanh toán ngay'}
              </Button>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default BookingCheckoutPage;
