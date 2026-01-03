import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  DirectionsBus,
  CalendarToday,
  LocationOn,
  AccessTime,
  ConfirmationNumber,
  Home,
  Receipt,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getBookingById } from '@/lib/api/trips';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/format';
import { useBookingConfirmation } from '@/hooks/useSocket';
import type { BookingConfirmedEvent } from '@/types/SocketTypes';

export const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.searchStr);

  const ticketId = searchParams.get('ticketId');
  const [isRealTimeConfirmed, setIsRealTimeConfirmed] = useState(false);

  // Fetch Ticket Details
  const {
    data: bookingData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['booking', ticketId],
    queryFn: () => getBookingById(ticketId!),
    enabled: !!ticketId,
    refetchInterval: (query) => {
      // Auto refetch every 3s until confirmed
      const data = query.state.data;
      if (data?.status === 'confirmed') return false;
      return 3000;
    },
  });

  // Listen for real-time confirmation
  useBookingConfirmation(bookingData?.ticketCode || null, (data: BookingConfirmedEvent) => {
    console.log('[PaymentSuccessPage] Real-time booking confirmation received:', data);
    if (data.status === 'CONFIRMED') {
      setIsRealTimeConfirmed(true);
      refetch();
    }
  });

  const isConfirmed = bookingData?.status === 'confirmed' || isRealTimeConfirmed;

  // Redirect if no ticketId
  useEffect(() => {
    if (!ticketId) {
      navigate({ to: '/' });
    }
  }, [ticketId, navigate]);

  if (!ticketId) {
    return null;
  }

  if (isLoading) {
    return (
      <Container
        sx={{
          py: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={60} />
          <Typography color="text.secondary">Đang xác nhận thanh toán...</Typography>
        </Stack>
      </Container>
    );
  }

  if (isError || !bookingData) {
    return (
      <Container sx={{ py: 10 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Không thể tải thông tin đơn hàng. Vui lòng kiểm tra lại sau.
        </Alert>
        <Button variant="contained" onClick={() => navigate({ to: '/' })}>
          Quay về trang chủ
        </Button>
      </Container>
    );
  }

  const { ticketCode, pricing, tripDetails, seats } = bookingData;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Success Header */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          mb: 4,
        }}
      >
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)' },
              '70%': { boxShadow: '0 0 0 20px rgba(76, 175, 80, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' },
            },
          }}
        >
          <CheckCircle sx={{ fontSize: 60, color: 'white' }} />
        </Box>

        <Typography variant="h4" fontWeight="bold" color="success.dark" gutterBottom>
          Thanh toán thành công!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
          Cảm ơn bạn đã đặt vé. Thông tin vé đã được gửi đến email của bạn.
        </Typography>
      </Paper>

      {/* Ticket Information */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <ConfirmationNumber color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Thông tin vé
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Ticket Code */}
        <Box
          sx={{
            bgcolor: '#f5f5f5',
            p: 2,
            borderRadius: 2,
            textAlign: 'center',
            mb: 3,
            border: '2px dashed',
            borderColor: 'primary.main',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Mã vé
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ letterSpacing: 2 }}>
            {ticketCode}
          </Typography>
        </Box>

        {/* Trip Details */}
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

        {/* Seats & Pricing */}
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Ghế đã đặt:</Typography>
            <Typography fontWeight={700} color="primary.main">
              {seats.join(', ')}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Số lượng:</Typography>
            <Typography fontWeight={700}>{seats.length} ghế</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Trạng thái:</Typography>
            <Typography fontWeight={700} color={isConfirmed ? 'success.main' : 'warning.main'}>
              {isConfirmed ? '✅ Đã xác nhận' : '⏳ Đang xử lý'}
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            Tổng thanh toán
          </Typography>
          <Typography variant="h5" fontWeight={700} color="success.main">
            {formatCurrency(pricing.total)}
          </Typography>
        </Stack>
      </Paper>

      {/* Action Buttons */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Home />}
          onClick={() => navigate({ to: '/' })}
          sx={{ flex: 1, py: 1.5 }}
        >
          Về trang chủ
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<Receipt />}
          onClick={() => navigate({ to: '/tickets' })}
          sx={{ flex: 1, py: 1.5 }}
        >
          Xem vé của tôi
        </Button>
      </Stack>

      {/* Note */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Lưu ý:</strong> Vui lòng lưu lại mã vé <strong>{ticketCode}</strong> để sử dụng
          khi lên xe. Bạn có thể xem lại thông tin vé trong mục "Vé của tôi".
        </Typography>
      </Alert>
    </Container>
  );
};
