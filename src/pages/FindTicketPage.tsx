import React, { useRef, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  ReceiptLong,
  PhoneIphone,
  Email,
  ArrowForward,
  CheckCircle,
  Cancel,
  AccessTime,
  CalendarToday,
  LocationOn,
  DirectionsBus,
  Download,
} from '@mui/icons-material';

// 1. CHANGED: Import toPng from html-to-image instead of html2canvas
import { toPng } from 'html-to-image';

// Imports
import { useTicketLookup } from '@/hooks/useTicketLookup';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/format';

const FindTicketPage: React.FC = () => {
  const { formData, ticket, isLoading, isError, updateField, handleSubmit } = useTicketLookup();

  // Refs and state
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // 2. CHANGED: Refactored download handler
  const handleDownloadImage = async () => {
    if (!ticketRef.current || !ticket) return;

    try {
      setIsDownloading(true);

      // Wait briefly for any animations or webfonts to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true, // Ensures images are re-fetched to avoid CORS issues
        backgroundColor: '#ffffff', // Force white background
        pixelRatio: 2, // High resolution (equivalent to scale: 2)
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `Ve-xe-${ticket.ticketCode}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating ticket image:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 8 }}>
      {/* --- HERO SECTION --- */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6, textAlign: 'center', mb: -4 }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Tra cứu vé xe
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Kiểm tra trạng thái đặt chỗ và tải vé điện tử của bạn
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4, position: 'relative', zIndex: 2 }}>
          {/* --- SEARCH FORM --- */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Typography variant="h6" fontWeight={700} color="text.secondary">
                Nhập thông tin đặt vé
              </Typography>

              <TextField
                label="Mã vé (Ticket Code)"
                placeholder="Ví dụ: VXS-123456"
                fullWidth
                required
                value={formData.ticketCode}
                onChange={(e) => updateField('ticketCode', e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <ReceiptLong color="action" sx={{ mr: 1.5 }} />,
                  },
                }}
              />

              <TextField
                label="Số điện thoại hoặc Email"
                placeholder="Nhập SĐT hoặc Email đã dùng đặt vé"
                fullWidth
                required
                value={formData.verificationValue}
                onChange={(e) => updateField('verificationValue', e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ display: 'flex', color: 'text.secondary', mr: 1.5 }}>
                        <PhoneIphone sx={{ fontSize: 20 }} />
                        <Typography sx={{ mx: 0.5 }}>/</Typography>
                        <Email sx={{ fontSize: 20 }} />
                      </Box>
                    ),
                  },
                }}
              />

              {isError && (
                <Alert severity="error">
                  Không tìm thấy vé. Vui lòng kiểm tra lại Mã vé và thông tin xác thực.
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: 'none',
                }}
              >
                {isLoading ? 'Đang tìm kiếm...' : 'Tra cứu ngay'}
              </Button>
            </Stack>
          </form>

          {/* --- TICKET RESULT --- */}
          {ticket && (
            <>
              <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

              {/* TICKET WRAPPER */}
              <Box
                ref={ticketRef}
                sx={{
                  animation: 'fadeIn 0.5s ease-in-out',
                  bgcolor: 'background.paper',
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    Kết quả tra cứu
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    color="primary.main"
                    sx={{ opacity: 0.5 }}
                  >
                    VEXESIEURE
                  </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  {ticket.status === 'cancelled' ? (
                    <Cancel color="error" sx={{ fontSize: 48 }} />
                  ) : (
                    <CheckCircle
                      color={ticket.status === 'confirmed' ? 'success' : 'warning'}
                      sx={{ fontSize: 48 }}
                    />
                  )}
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {ticket.ticketCode}
                    </Typography>
                    <Chip
                      label={
                        ticket.status === 'confirmed'
                          ? 'Đã thanh toán'
                          : ticket.status === 'pending'
                            ? 'Chờ thanh toán'
                            : 'Đã hủy'
                      }
                      color={
                        ticket.status === 'confirmed'
                          ? 'success'
                          : ticket.status === 'pending'
                            ? 'warning'
                            : 'error'
                      }
                      size="small"
                      sx={{ mt: 0.5, fontWeight: 600 }}
                    />
                  </Box>
                </Stack>

                {ticket.tripDetails && (
                  <Box
                    sx={{
                      bgcolor: '#f8f9fa',
                      p: 3,
                      borderRadius: 2,
                      border: '1px solid #eee',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      gutterBottom
                      sx={{ color: 'primary.main' }}
                    >
                      {ticket.tripDetails.operator}
                    </Typography>

                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <DirectionsBus color="action" />
                        <Typography fontWeight={500}>{ticket.tripDetails.route}</Typography>
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Khởi hành
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AccessTime fontSize="small" color="action" />
                            <Typography fontWeight={600}>
                              {formatTime(ticket.tripDetails.departureTime)}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarToday fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatDate(ticket.tripDetails.departureTime)}
                            </Typography>
                          </Stack>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.disabled' }}>
                          <ArrowForward />
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Đến nơi
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AccessTime fontSize="small" color="action" />
                            <Typography fontWeight={600}>
                              {formatTime(ticket.tripDetails.arrivalTime)}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatDate(ticket.tripDetails.arrivalTime)}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>
                )}

                <Box sx={{ mt: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ py: 1, borderBottom: '1px dashed #e0e0e0' }}
                  >
                    <Typography color="text.secondary">Hành khách</Typography>
                    <Typography fontWeight={500}>{ticket.contactName}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ py: 1, borderBottom: '1px dashed #e0e0e0' }}
                  >
                    <Typography color="text.secondary">Email</Typography>
                    <Typography fontWeight={500}>{ticket.contactEmail}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ py: 1, borderBottom: '1px dashed #e0e0e0' }}
                  >
                    <Typography color="text.secondary">Số điện thoại</Typography>
                    <Typography fontWeight={500}>{ticket.contactPhone}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ py: 1, borderBottom: '1px dashed #e0e0e0' }}
                  >
                    <Typography color="text.secondary">Số ghế</Typography>
                    <Typography fontWeight={700} color="primary.main">
                      {ticket.seats.join(', ')}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ pt: 2 }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      Tổng tiền
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="secondary.main">
                      {formatCurrency(ticket.pricing.total)}
                    </Typography>
                  </Stack>
                </Box>
              </Box>

              {/* ACTIONS */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                {ticket.status === 'pending' && (
                  <Button
                    variant="contained"
                    fullWidth
                    color="warning"
                    sx={{ fontWeight: 700 }}
                    href={`/booking/checkout?ticketId=${ticket.ticketId}`}
                  >
                    Thanh toán ngay
                  </Button>
                )}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  startIcon={
                    isDownloading ? <CircularProgress size={20} color="inherit" /> : <Download />
                  }
                >
                  {isDownloading ? 'Đang tạo ảnh...' : 'Tải vé điện tử'}
                </Button>
              </Stack>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default FindTicketPage;
