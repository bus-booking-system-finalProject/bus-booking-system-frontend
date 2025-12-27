import { useState, useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';
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
import { AccessTime, CreditCard, Wallet, DirectionsBusFilled, QrCode } from '@mui/icons-material';
import { formatCurrency, formatTime } from '@/lib/utils/format';
import { useQuery } from '@tanstack/react-query';
import { getBookingById } from '@/lib/api/trips';

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
  // Get ticketId from query params (preferred) or state
  const location = useLocation();
  const searchParams = new URLSearchParams(location.searchStr);

  const state = location.state as PaymentPageState | undefined;
  const ticketId = searchParams.get('ticketId') || state?.ticketId;

  const [paymentMethod, setPaymentMethod] = useState('payos');

  const [fallbackExpiry] = useState(() => new Date(Date.now() + 10 * 60000).toISOString());

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
  const { ticketCode, pricing, tripDetails, lockedUntil, contactName, contactPhone, contactEmail } =
    bookingData;

  // Use backend provided time, or local fallback (calculated purely)
  const expiredAt = lockedUntil || fallbackExpiry;

  const handlePayment = () => {
    alert(`Đang chuyển hướng thanh toán ${paymentMethod} cho mã đặt chỗ ${ticketCode}...`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 1. Countdown Timer */}
      <CountdownTimer targetDate={expiredAt} />

      <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
        Cổng Thanh Toán
      </Typography>

      <Grid container spacing={4}>
        {/* Left: Payment Methods */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Chọn phương thức thanh toán
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <Paper
                variant="outlined"
                sx={{
                  mb: 2,
                  p: 1,
                  borderColor: paymentMethod === 'payos' ? 'primary.main' : 'divider',
                }}
              >
                <FormControlLabel
                  value="payos"
                  control={<Radio />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box>
                        <Stack
                          direction="row"
                          alignItems="flex-start"
                          spacing={1}
                          sx={{ width: '100%', pt: 0.5 }}
                        >
                          <QrCode color="primary" />
                          <Typography fontWeight="bold">QR Chuyển khoản / Ví điện tử</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Không cần nhập thông tin. Xác nhận thanh toán tức thì, nhanh chóng và ít
                          sai sót.
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  mb: 2,
                  p: 1,
                  borderColor: paymentMethod === 'momo' ? 'primary.main' : 'divider',
                }}
              >
                <FormControlLabel
                  value="momo"
                  control={<Radio />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box>
                        <Stack
                          direction="row"
                          alignItems="flex-start"
                          spacing={1}
                          sx={{ width: '100%', pt: 0.5 }}
                        >
                          <Wallet color="primary" />
                          <Typography fontWeight="bold">Ví MoMo</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Thanh toán qua ứng dụng MoMo
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  mb: 2,
                  p: 1,
                  borderColor: paymentMethod === 'card' ? 'primary.main' : 'divider',
                }}
              >
                <FormControlLabel
                  value="card"
                  control={<Radio />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box>
                        <Stack
                          direction="row"
                          alignItems="flex-start"
                          spacing={1}
                          sx={{ width: '100%', pt: 0.5 }}
                        >
                          <CreditCard color="primary" />
                          <Typography fontWeight="bold">Thẻ Quốc tế</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Thẻ Visa, MasterCard, JCB
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  borderColor: paymentMethod === 'cash' ? 'primary.main' : 'divider',
                }}
              >
                <FormControlLabel
                  value="cash"
                  control={<Radio />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box>
                        <Stack
                          direction="row"
                          alignItems="flex-start"
                          spacing={1}
                          sx={{ width: '100%', pt: 0.5 }}
                        >
                          <DirectionsBusFilled color="primary" />
                          <Typography fontWeight="bold">Thanh toán tại nhà xe</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Bạn phải ra văn phòng nhà xe và thanh toán cho nhân viên tại quầy để lấy
                          vé trước.
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Paper>
            </RadioGroup>
          </Paper>

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3, py: 1.5, fontSize: '1.1rem' }}
            onClick={handlePayment}
          >
            Thanh toán
          </Button>
        </Grid>

        {/* Right: Booking Summary */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Thông tin đơn hàng
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Mã đặt chỗ
              </Typography>
              <Typography variant="h6" color="primary">
                {ticketCode}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Khách hàng
              </Typography>
              <Typography fontWeight="medium">{contactName}</Typography>
              <Typography variant="body2">{contactPhone}</Typography>
              <Typography variant="body2">{contactEmail}</Typography>
            </Box>

            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

            {tripDetails && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {tripDetails.operator}
                </Typography>
                <Typography variant="body2" paragraph>
                  {tripDetails.route}
                </Typography>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Giờ khởi hành:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatTime(tripDetails.departureTime)}
                  </Typography>
                </Box>
              </>
            )}

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Số ghế:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {bookingData.seats.join(', ')}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Tổng thanh toán:</Typography>
              <Typography variant="h5" color="error" fontWeight="bold">
                {formatCurrency(pricing.total)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
