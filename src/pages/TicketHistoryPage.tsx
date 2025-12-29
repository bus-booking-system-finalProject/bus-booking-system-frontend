// src/pages/TicketHistoryPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  Divider,
  type ChipProps,
} from '@mui/material';
import {
  DirectionsBus,
  CalendarToday,
  AccessTime,
  ConfirmationNumber,
  EventSeat,
  History,
} from '@mui/icons-material';
import { getMyTickets, cancelTicket } from '@/lib/api/trips';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { useAuth } from '@/hooks/useAuth';

interface ApiErrorResponse {
  success: boolean;
  message: string;
}

const TicketHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get Token from Auth
  const { accessToken } = useAuth();

  const [page, setPage] = useState(1);
  const LIMIT = 5;

  // Pass token to query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-tickets', page, LIMIT, accessToken],
    queryFn: () => getMyTickets(page, LIMIT),
    staleTime: 1000 * 60,
    enabled: !!accessToken,
  });

  // Pass token to mutation
  const cancelMutation = useMutation({
    mutationFn: (ticketId: string) => cancelTicket(ticketId),
    onSuccess: () => {
      alert('Hủy vé thành công!');
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error.response?.data?.message || 'Không thể hủy vé. Vui lòng thử lại.';
      alert(msg);
    },
  });

  // --- Helpers ---
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // UPDATED: Added logic for 'completed'
  const getStatusColor = (status: string): ChipProps['color'] => {
    switch (status) {
      case 'completed':
        return 'info'; // Blue/Purple for completed
      case 'confirmed':
        return 'success'; // Green for paid/confirmed
      case 'pending':
        return 'warning'; // Orange for pending
      case 'cancelled':
        return 'error'; // Red for cancelled
      default:
        return 'default';
    }
  };

  // UPDATED: Added label for 'completed'
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'confirmed':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Helper to determine border color based on status
  const getBorderColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'info.main';
      case 'confirmed':
        return 'success.main';
      case 'pending':
        return 'warning.main';
      case 'cancelled':
        return 'error.main';
      default:
        return 'grey.300';
    }
  };

  // --- Handlers ---
  const handleViewTicket = (ticketId: string) => {
    navigate({
      to: '/booking/details',
      search: { ticketId },
    });
  };

  const handleCancelTicket = (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn hủy vé này không?')) {
      cancelMutation.mutate(ticketId);
    }
  };

  const handlePayNow = (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation();
    navigate({
      to: '/booking/details',
      search: { ticketId },
    });
  };

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <History color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>
            Lịch sử đặt vé
          </Typography>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">Có lỗi xảy ra khi tải lịch sử vé.</Alert>
        ) : data?.data.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Bạn chưa có lịch sử đặt vé nào.</Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {data?.data.map((ticket) => (
              <Paper
                key={ticket.ticketId}
                elevation={2}
                onClick={() => handleViewTicket(ticket.ticketId)}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderLeft: `6px solid`,
                  borderColor: getBorderColor(ticket.status), // Use helper
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      {ticket.trip.operator}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                      <ConfirmationNumber fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Mã vé: <b>{ticket.ticketCode}</b>
                      </Typography>
                    </Stack>
                  </Box>
                  <Chip
                    label={getStatusLabel(ticket.status)}
                    color={getStatusColor(ticket.status)}
                    size="small"
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>

                <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Box sx={{ flex: 1, width: '100%' }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <DirectionsBus fontSize="small" color="action" />
                        <Typography fontWeight={600}>{ticket.trip.route}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formatTime(ticket.trip.departureTime)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formatDate(ticket.trip.departureTime)}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EventSeat fontSize="small" color="action" />
                        <Typography variant="body2">
                          Ghế: <b>{ticket.seats.join(', ')}</b>
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  <Stack
                    spacing={2}
                    alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
                    sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: '200px' }}
                  >
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="caption" color="text.secondary">
                        Tổng tiền
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="secondary.main">
                        {formatCurrency(ticket.totalAmount)}
                      </Typography>
                    </Box>

                    {/* ACTIONS: Only for Pending */}
                    <Stack direction="row" spacing={1}>
                      {ticket.status === 'pending' && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          disabled={cancelMutation.isPending}
                          onClick={(e) => handleCancelTicket(e, ticket.ticketId)}
                        >
                          {cancelMutation.isPending ? 'Đang xử lý...' : 'Hủy'}
                        </Button>
                      )}

                      {ticket.status === 'pending' && (
                        <Button
                          variant="contained"
                          color="warning"
                          size="small"
                          sx={{ fontWeight: 700, color: 'black' }}
                          onClick={(e) => handlePayNow(e, ticket.ticketId)}
                        >
                          Thanh toán
                        </Button>
                      )}

                      {/* Optional: Add a visual indicator for completed trips, though clicking the card works */}
                      {ticket.status === 'completed' && (
                        <Typography
                          variant="caption"
                          color="info.main"
                          sx={{ fontStyle: 'italic' }}
                        >
                          Chạm để xem chi tiết & đánh giá
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            ))}

            {data && data.pagination.totalPages > 1 && (
              <Stack alignItems="center" sx={{ mt: 2 }}>
                <Pagination
                  count={data.pagination.totalPages}
                  page={page}
                  onChange={(_, p) => setPage(p)}
                  color="primary"
                />
              </Stack>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default TicketHistoryPage;
