import React, { useState, useEffect, useMemo } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // 1. Import Mutation hooks
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
  Snackbar,
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
  Payment,
} from '@mui/icons-material';
import { getBookingById, cancelTicket } from '@/lib/api/trips';
import { createPaymentLink } from '@/lib/api/PaymentApi';
import { bookingCheckoutRoute } from '@/routes/BookingCheckoutRoute';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  success: boolean;
  message: string;
}

const BookingCheckoutPage: React.FC = () => {
  const { ticketId, code, status, cancel } = useSearch({ from: bookingCheckoutRoute.id });
  const { accessToken } = useAuth(); // 4. Get Access Token
  const queryClient = useQueryClient();

  // 1. STATE: We only track "now". We don't track "timeLeft" in state anymore.
  const [now, setNow] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const {
    data: booking,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['booking', ticketId],
    queryFn: () => getBookingById(ticketId),
    enabled: !!ticketId,
  });

  // --- PAYMENT MUTATION ---
  const paymentMutation = useMutation({
    mutationFn: async () => {
      // Construct the return URL to be the current page
      const currentUrl = `${window.location.origin}${window.location.pathname}?ticketId=${ticketId}`;

      return createPaymentLink({
        ticketId,
        returnUrl: currentUrl,
        cancelUrl: currentUrl,
      });
    },
    onSuccess: (data) => {
      if (data.success && data.checkoutUrl) {
        // Redirect user to PayOS
        window.location.href = data.checkoutUrl;
      } else {
        alert('Không thể tạo liên kết thanh toán. Vui lòng thử lại.');
      }
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error.response?.data?.message || 'Lỗi khi tạo thanh toán.';
      alert(msg);
    },
  });

  // --- CANCEL MUTATION ---
  const cancelMutation = useMutation({
    mutationFn: () => cancelTicket(ticketId),
    onSuccess: () => {
      alert('Hủy vé thành công!');
      // Refresh the booking data to show "Cancelled" status immediately
      queryClient.invalidateQueries({ queryKey: ['booking', ticketId] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error.response?.data?.message || 'Không thể hủy vé. Vui lòng thử lại.';
      alert(msg);
    },
  });

  // --- HANDLE PAYMENT RETURN ---
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // If we have returned from payment gateway with success code
    if (code === '00' && status === 'PAID') {
      timer = setTimeout(() => {
        setShowSuccessToast(true);
        queryClient.invalidateQueries({ queryKey: ['booking', ticketId] });
      }, 0);
    } else if (cancel === true) {
      // Handle cancelled payment if necessary
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [code, status, cancel, ticketId, queryClient]);

  // 2. EFFECT: Just keeps the clock ticking. No complex logic here.
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 3. DERIVED STATE: Calculate Expiration and TimeLeft during render.
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

  // Calculate milliseconds left
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

  // --- Handler ---
  const handleCancelClick = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy vé này không?')) {
      cancelMutation.mutate();
    }
  };

  const handlePaymentClick = () => {
    paymentMutation.mutate();
  };

  if (isLoading)
    return (
      <Box sx={{ p: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );

  if (isError || !booking) return <Alert severity="error">Không tìm thấy thông tin vé.</Alert>;

  // Determine Logic
  const isPaid = booking.status === 'confirmed';
  const isCancelled = booking.status === 'cancelled';
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
                ) : isPaid ? (
                  <CheckCircle color="success" sx={{ fontSize: 40 }} />
                ) : (
                  <Payment color="warning" sx={{ fontSize: 40 }} />
                )}

                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={isCancelled ? 'error.main' : isPaid ? 'success.main' : 'warning.main'}
                  >
                    {isCancelled
                      ? 'Vé đã bị hủy'
                      : isPaid
                        ? 'Thanh toán thành công'
                        : 'Chờ thanh toán'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mã vé: <b>{booking.ticketCode}</b> • Trạng thái:{' '}
                    <span
                      style={{
                        color: isCancelled ? '#d32f2f' : isPaid ? '#2e7d32' : '#ed6c02',
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                      }}
                    >
                      {isCancelled ? 'Đã hủy' : isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}
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
                Vé này đã bị hủy.
              </Alert>
            ) : isPaid ? (
              <Alert severity="success" icon={<CheckCircle />}>
                Bạn đã thanh toán vé thành công. Chúc bạn có một chuyến đi vui vẻ!
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

              {/* ACTION BUTTONS */}
              <Stack spacing={2}>
                {!isPaid && !isCancelled && !isExpired && (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={paymentMutation.isPending}
                    onClick={handlePaymentClick}
                    sx={{
                      bgcolor: '#FFC107',
                      color: 'black',
                      fontWeight: 700,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: '#ffb300',
                      },
                    }}
                  >
                    {paymentMutation.isPending ? 'Đang tạo thanh toán...' : 'Thanh toán ngay'}
                  </Button>
                )}

                {isPaid && (
                  <Button variant="contained" color="success" fullWidth size="large" disabled>
                    Đã thanh toán
                  </Button>
                )}

                {(isExpired || isCancelled) && (
                  <Button variant="contained" disabled fullWidth size="large">
                    {isCancelled ? 'Vé đã hủy' : 'Hết thời gian'}
                  </Button>
                )}

                {!isInteractionDisabled && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    fullWidth
                    disabled={cancelMutation.isPending}
                    onClick={handleCancelClick}
                    sx={{
                      fontWeight: 600,
                      py: 1.2,
                    }}
                  >
                    {cancelMutation.isPending ? 'Đang hủy...' : 'Hủy vé'}
                  </Button>
                )}
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </Container>

      {/* SUCCESS TOAST */}
      <Snackbar
        open={showSuccessToast}
        autoHideDuration={6000}
        onClose={() => setShowSuccessToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccessToast(false)} severity="success" sx={{ width: '100%' }}>
          Thanh toán thành công!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookingCheckoutPage;
