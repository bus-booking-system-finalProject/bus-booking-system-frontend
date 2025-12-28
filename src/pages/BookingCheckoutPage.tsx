import React, { useState, useEffect, useMemo } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
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
  Flag, // Icon for Completed
  RateReview, // Icon for Review
} from '@mui/icons-material';
import { getBookingById, cancelTicket } from '@/lib/api/trips';
import { createPaymentLink } from '@/lib/api/PaymentApi';
import { apiPrivate } from '@/lib/api/axios'; // Ensure apiPrivate is imported
import { bookingCheckoutRoute } from '@/routes/BookingCheckoutRoute';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  success: boolean;
  message: string;
}

interface FeedbackPayload {
  tripId: string;
  rating: number;
  comment: string;
}

const BookingCheckoutPage: React.FC = () => {
  const { ticketId, code, status } = useSearch({ from: bookingCheckoutRoute.id });
  const { accessToken } = useAuth(); // Get Access Token for review
  const queryClient = useQueryClient();

  // 1. STATE
  const [now, setNow] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Review Dialog State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState('');

  const {
    data: booking,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['booking', ticketId],
    queryFn: () => getBookingById(ticketId),
    enabled: !!ticketId,
  });

  // --- API: Submit Feedback ---
  const submitFeedback = async (payload: FeedbackPayload) => {
    const response = await apiPrivate.post('/feedback', payload);
    return response.data;
  };

  // --- MUTATION: Payment ---
  const paymentMutation = useMutation({
    mutationFn: async () => {
      const currentUrl = `${window.location.origin}${window.location.pathname}?ticketId=${ticketId}`;
      return createPaymentLink({
        ticketId,
        returnUrl: currentUrl,
        cancelUrl: currentUrl,
      });
    },
    onSuccess: (data) => {
      if (data.success && data.checkoutUrl) {
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

  // --- MUTATION: Cancel ---
  const cancelMutation = useMutation({
    mutationFn: () => cancelTicket(ticketId),
    onSuccess: () => {
      alert('Hủy vé thành công!');
      queryClient.invalidateQueries({ queryKey: ['booking', ticketId] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error.response?.data?.message || 'Không thể hủy vé. Vui lòng thử lại.';
      alert(msg);
    },
  });

  // --- MUTATION: Feedback ---
  const feedbackMutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      setIsReviewOpen(false);
      alert('Cảm ơn bạn đã đánh giá chuyến đi!');
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error.response?.data?.message || 'Lỗi khi gửi đánh giá.';
      alert(msg);
    },
  });

  // --- HANDLE PAYMENT RETURN ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (code === '00' && status === 'PAID') {
      timer = setTimeout(() => {
        setShowSuccessToast(true);
        queryClient.invalidateQueries({ queryKey: ['booking', ticketId] });
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [code, status, ticketId, queryClient]);

  // 2. EFFECT: Clock ticking
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. DERIVED STATE: Calculate Expiration (Preserved Logic)
  const expirationTime = useMemo(() => {
    // Only calculate if pending
    if (booking?.status === 'pending' && booking.createdAt) {
      let dateStr = booking.createdAt;
      if (!dateStr.endsWith('Z') && !dateStr.includes('+')) {
        dateStr += 'Z';
      }
      const createdTime = new Date(dateStr).getTime();
      return createdTime + 10 * 60 * 1000; // + 10 minutes
    }
    return null;
  }, [booking]);

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

  // --- Handlers ---
  const handleCancelClick = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy vé này không?')) {
      cancelMutation.mutate();
    }
  };

  const handlePaymentClick = () => {
    paymentMutation.mutate();
  };

  const handleSubmitReview = () => {
    // Determine tripId from nested object or root
    const tripId = booking?.tripDetails?.tripId || booking?.tripId;
    if (!tripId) {
      alert('Không tìm thấy thông tin chuyến đi.');
      return;
    }
    feedbackMutation.mutate({
      tripId: tripId,
      rating: rating || 5,
      comment: comment,
    });
  };

  if (isLoading)
    return (
      <Box sx={{ p: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );

  if (isError || !booking) return <Alert severity="error">Không tìm thấy thông tin vé.</Alert>;

  // --- STATUS LOGIC (Updated for 2 new statuses) ---
  const isCompleted = booking.status === 'completed'; // New
  const isConfirmed = booking.status === 'confirmed'; // New Name for Paid
  const isCancelled = booking.status === 'cancelled';
  const isPending = booking.status === 'pending';
  const isExpired = isPending && timeLeft === 0;

  // Interaction Logic: Can't cancel if completed, cancelled or expired
  const isInteractionDisabled = isCancelled || isExpired || isCompleted;

  // UI Variables based on status
  let statusColor = 'warning.main';
  let StatusIcon = Payment;
  let statusText = 'Chờ thanh toán';

  if (isCancelled) {
    statusColor = 'error.main';
    StatusIcon = Cancel;
    statusText = 'Vé đã bị hủy';
  } else if (isCompleted) {
    statusColor = 'info.main';
    StatusIcon = Flag;
    statusText = 'Chuyến đi đã hoàn thành';
  } else if (isConfirmed) {
    statusColor = 'success.main';
    StatusIcon = CheckCircle;
    statusText = 'Thanh toán thành công';
  }

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 10 }}>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => window.history.back()} sx={{ mb: 2 }}>
          Quay lại
        </Button>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Chi tiết vé
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start">
          {/* LEFT: STATUS & INFO */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              {/* Status Header */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <StatusIcon sx={{ fontSize: 40, color: statusColor }} />
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: statusColor }}>
                    {statusText}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mã vé: <b>{booking.ticketCode}</b>
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

            {/* Dynamic Alert Banner */}
            {isCancelled ? (
              <Alert severity="error" icon={<Cancel />}>
                Vé này đã bị hủy.
              </Alert>
            ) : isCompleted ? (
              <Alert severity="info" icon={<Flag />}>
                Chuyến đi đã kết thúc. Hy vọng bạn đã có trải nghiệm tuyệt vời!
              </Alert>
            ) : isConfirmed ? (
              <Alert severity="success" icon={<CheckCircle />}>
                Bạn đã thanh toán vé thành công. Chúc bạn có một chuyến đi vui vẻ!
              </Alert>
            ) : (
              // Pending Status
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
                  {!isExpired && (
                    <Typography variant="subtitle1" fontWeight={800} color="warning.dark">
                      {formatCountdown(timeLeft)}
                    </Typography>
                  )}
                </Stack>
              </Alert>
            )}
          </Box>

          {/* RIGHT: TRIP SUMMARY & ACTIONS */}
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
                {/* 1. Review Button (Completed & Logged In) */}
                {isCompleted && accessToken && (
                  <Button
                    variant="contained"
                    startIcon={<RateReview />}
                    onClick={() => setIsReviewOpen(true)}
                    sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
                  >
                    Viết đánh giá
                  </Button>
                )}

                {/* 2. Payment Button (Only if Pending & Not Expired) */}
                {isPending && !isExpired && (
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

                {/* 3. Static Status Buttons */}
                {isConfirmed && (
                  <Button variant="contained" color="success" fullWidth size="large" disabled>
                    Đã thanh toán
                  </Button>
                )}
                {isCompleted && (
                  <Button variant="outlined" color="info" fullWidth size="large" disabled>
                    Hoàn thành
                  </Button>
                )}
                {(isExpired || isCancelled) && (
                  <Button variant="contained" disabled fullWidth size="large">
                    {isCancelled ? 'Vé đã hủy' : 'Hết thời gian'}
                  </Button>
                )}

                {/* 4. Cancel Button (Only if NOT cancelled/completed/expired) */}
                {!isInteractionDisabled && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    fullWidth
                    disabled={cancelMutation.isPending}
                    onClick={handleCancelClick}
                    sx={{ fontWeight: 600, py: 1.2 }}
                  >
                    {cancelMutation.isPending ? 'Đang hủy...' : 'Hủy vé'}
                  </Button>
                )}
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </Container>

      {/* FEEDBACK DIALOG */}
      <Dialog open={isReviewOpen} onClose={() => setIsReviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đánh giá chuyến đi</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography component="legend">Mức độ hài lòng</Typography>
              <Rating
                name="rating"
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
                size="large"
              />
            </Box>
            <TextField
              label="Nhận xét của bạn"
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về chuyến đi này..."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsReviewOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={!rating || feedbackMutation.isPending}
          >
            {feedbackMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </DialogActions>
      </Dialog>

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
