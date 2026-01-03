import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Divider,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  AccessTime,
  DirectionsBus,
  CalendarToday,
  LocationOn,
  Cancel,
  CheckCircle,
} from '@mui/icons-material';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/format';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBookingById } from '@/lib/api/trips';
import type { AxiosError } from 'axios';
import { PayOsPayment } from '@/lib/api/PaymentApi';
import { PaymentMethods } from '@/config/PaymentMethods';
import { useBookingConfirmation } from '@/hooks/useSocket';
import type { BookingConfirmedEvent } from '@/types/SocketTypes';

// Helper component for Countdown
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setIsExpired(true);
        setTimeLeft('00:00');
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <Box
      sx={{
        bgcolor: isExpired ? '#ffebee' : '#e3f2fd',
        color: isExpired ? 'error.main' : 'primary.main',
        p: 2,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        mb: 3,
      }}
    >
      <AccessTime />
      <Typography fontWeight="bold">
        {isExpired ? 'Giao dịch đã hết hạn' : `Thời gian thanh toán còn lại: ${timeLeft}`}
      </Typography>
    </Box>
  );
};

interface PaymentPageState {
  ticketId?: string;
}

export const PaymentGatewayPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get ticketId from query params (preferred) or state
  const location = useLocation();
  const searchParams = new URLSearchParams(location.searchStr);

  const state = location.state as PaymentPageState | undefined;
  const ticketId = searchParams.get('ticketId') || state?.ticketId;

  const [paymentMethod, setPaymentMethod] = useState<
    string | 'payos' | 'domestic-card' | 'momo' | 'cash' | 'international-card'
  >('payos');

  // State for real-time confirmation
  const [isRealTimeConfirmed, setIsRealTimeConfirmed] = useState(false);

  // Fetch Ticket Details
  const {
    data: bookingData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['booking', ticketId],
    queryFn: () => getBookingById(ticketId!),
    enabled: !!ticketId,
  });

  // --- REAL-TIME BOOKING CONFIRMATION ---
  // Listen for socket events when payment is successful
  useBookingConfirmation(bookingData?.ticketCode || null, (data: BookingConfirmedEvent) => {
    console.log('[PaymentGatewayPage] Real-time booking confirmation received:', data);
    if (data.status === 'CONFIRMED') {
      setIsRealTimeConfirmed(true);
      // Refetch booking data to update UI
      queryClient.invalidateQueries({ queryKey: ['booking', ticketId] });
    }
  });

  const payosPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!ticketId) throw new Error('No ticket ID');

      // Success URL - Navigate to PaymentSuccessPage
      const successUrl = `${window.location.origin}/payment/success?ticketId=${ticketId}`;
      // Cancel URL - Stay on current payment page
      const cancelUrl = `${window.location.origin}${window.location.pathname}?ticketId=${ticketId}`;

      return PayOsPayment.createPaymentLink({
        ticketId,
        returnUrl: successUrl,
        cancelUrl: cancelUrl,
      });
    },
    onSuccess: (data) => {
      if (data.success && data.checkoutUrl) {
        // Redirect user to PayOS Checkout Page
        window.location.href = data.checkoutUrl;
      } else {
        alert('Không thể tạo liên kết thanh toán. Vui lòng thử lại.');
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const msg = error.response?.data?.message || 'Lỗi khi tạo thanh toán.';
      alert(msg);
    },
  });

  const expirationData = useMemo(() => {
    // Default fallback if data isn't ready
    if (!bookingData) return { expiredAt: new Date().toISOString(), isPaid: false };

    const { createdAt, status, lockedUntil } = bookingData;
    let targetTime = new Date().getTime();

    // Logic: Calculate Expiry = createdAt + 10 minutes
    if (createdAt) {
      let dateStr = createdAt;
      // Fix for backend ISO strings missing 'Z' (treat as UTC)
      if (!dateStr.endsWith('Z') && !dateStr.includes('+')) {
        dateStr += 'Z';
      }
      const createdTime = new Date(dateStr).getTime();
      targetTime = createdTime + 10 * 60 * 1000; // +10 minutes
    } else if (lockedUntil) {
      // Fallback to lockedUntil if createdAt is somehow missing
      targetTime = new Date(lockedUntil).getTime();
    }

    return {
      expiredAt: new Date(targetTime).toISOString(),
      isPaid: status === 'confirmed',
      isCancelled: status === 'cancelled',
    };
  }, [bookingData]);

  const { expiredAt, isPaid, isCancelled } = expirationData;

  // Combine API state with real-time state
  const isConfirmed = isPaid || isRealTimeConfirmed;

  if (!ticketId) {
    return (
      <Container>
        <Alert severity="error">Không tìm thấy mã vé thanh toán.</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError || !bookingData) {
    return (
      <Container sx={{ py: 10 }}>
        <Alert severity="error">Không thể tải thông tin đơn hàng.</Alert>
      </Container>
    );
  }

  if (!ticketId) {
    return (
      <Container>
        <Alert severity="error">Không tìm thấy mã vé thanh toán.</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError || !bookingData) {
    return (
      <Container sx={{ py: 10 }}>
        <Alert severity="error">Không thể tải thông tin đơn hàng.</Alert>
      </Container>
    );
  }

  // Derived data from API response
  const { ticketCode, pricing, tripDetails, seats } = bookingData;

  const handlePayment = () => {
    switch (paymentMethod) {
      case 'payos':
        // Trigger PayOS Link Creation
        payosPaymentMutation.mutate();
        break;

      case 'cash':
        // Handle Cash Payment (e.g., Navigate to confirmation or show instruction)
        alert(
          `Vui lòng đến văn phòng nhà xe để thanh toán cho mã vé ${ticketCode}. Vé sẽ được giữ trong khoảng thời gian quy định.`,
        );
        // navigate({ to: '/tickets' }); // Optional: Redirect to ticket history
        break;

      case 'momo':
      case 'domestic-card':
      case 'international-card':
        // Handle Maintenance / Future Implementation
        alert(`Phương thức thanh toán ${paymentMethod} đang bảo trì. Vui lòng chọn PayOS (QR).`);
        break;

      default:
        alert('Vui lòng chọn phương thức thanh toán hợp lệ.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 1. Countdown Timer */}
      {/* Show only if ticket is active (not paid, not cancelled) */}
      {!isConfirmed && !isCancelled && <CountdownTimer targetDate={expiredAt} />}

      {/* STATUS ALERTS */}
      {isConfirmed && (
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{ mb: 3, animation: isRealTimeConfirmed ? 'pulse 0.5s ease-in-out' : 'none' }}
        >
          {isRealTimeConfirmed
            ? 'Thanh toán thành công! Vé của bạn đã được xác nhận.'
            : 'Đơn hàng đã được thanh toán thành công!'}
        </Alert>
      )}
      {isCancelled && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Đơn hàng này đã bị hủy. Vui lòng đặt vé mới.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left: Payment Methods */}
        <Grid size={{ xs: 12, md: 7 }}>
          {isCancelled ? (
            <>
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Cancel color="error" sx={{ fontSize: 80, mb: 2, opacity: 0.8 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom color="error.main">
                  Vé đã bị hủy
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 450 }}>
                  Đơn hàng này đã bị hủy do quá hạn thanh toán. Vui lòng thực hiện đặt vé mới để
                  tiếp tục hành trình.
                </Typography>
              </Paper>
            </>
          ) : (
            <>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Chọn phương thức thanh toán
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {PaymentMethods.map((method) => (
                    <Paper
                      key={method.value}
                      variant="outlined"
                      sx={{
                        mb: 2,
                        p: 1,
                        borderColor: paymentMethod === method.value ? 'primary.main' : 'divider',
                        bgcolor: paymentMethod === method.value ? '#f5f9ff' : 'transparent', // Add highlight
                        transition: 'all 0.2s',
                      }}
                    >
                      <FormControlLabel
                        value={method.value}
                        control={<Radio />}
                        sx={{ width: '100%', m: 0, alignItems: 'flex-start' }}
                        label={
                          <Stack
                            alignItems="flex-start"
                            spacing={0.5}
                            sx={{ width: '100%', pt: 0.5 }}
                          >
                            {/* Clone icon to apply specific props if needed, or render directly */}
                            <Stack
                              direction="row"
                              alignItems="flex-start"
                              spacing={1}
                              sx={{ width: '100%', pt: 0.5 }}
                            >
                              {method.icon}
                              <Typography fontWeight="bold">{method.label}</Typography>
                            </Stack>

                            <Typography variant="caption" color="text.secondary">
                              {method.description}
                            </Typography>
                          </Stack>
                        }
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              </Paper>

              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 3, py: 1.5, fontSize: '1.1rem' }}
                onClick={handlePayment}
                disabled={isConfirmed || isCancelled || payosPaymentMutation.isPending}
              >
                {isConfirmed
                  ? '✅ Đã thanh toán'
                  : isCancelled
                    ? 'Đã hủy'
                    : payosPaymentMutation.isPending
                      ? 'Đang xử lý...'
                      : `Thanh toán ${formatCurrency(pricing.total)}`}
              </Button>
            </>
          )}
        </Grid>

        {/* Right: Booking Summary */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#fff', position: 'sticky' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Mã vé
            </Typography>
            <Typography variant="h6" color="primary">
              {ticketCode}
            </Typography>

            <Divider sx={{ my: 2 }} />
            {tripDetails && (
              <>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main" gutterBottom>
                  {tripDetails.operator}
                </Typography>
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <DirectionsBus fontSize="small" color="action" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {tripDetails.route}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2">
                      Đi: {formatTime(tripDetails.from.time)} • {formatDate(tripDetails.from.time)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2">
                      Đến: {formatTime(tripDetails.to.time)} • {formatDate(tripDetails.to.time)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2">Thời gian: {tripDetails.duration}</Typography>
                  </Stack>
                </Stack>
              </>
            )}
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography color="text.secondary">Ghế:</Typography>
              <Typography fontWeight={700} color="primary.main">
                {seats.join(', ')}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography color="text.secondary">Số lượng:</Typography>
              <Typography fontWeight={700}>{seats.length} ghế</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography color="text.secondary">Tổng tiền:</Typography>
              <Typography fontWeight={700}>{formatCurrency(pricing.total)}</Typography>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                Thanh toán
              </Typography>
              <Typography variant="h5" fontWeight={700} color="error">
                {formatCurrency(pricing.total)}
              </Typography>
            </Stack>
          </Paper>

          {isCancelled && (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate({ to: '/' })}
                sx={{
                  mt: 2,
                  width: '100%',
                }}
              >
                Quay về trang chủ
              </Button>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
