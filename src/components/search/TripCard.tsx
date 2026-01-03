import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Collapse,
  Tabs,
  Tab,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Pagination,
  Rating,
  Avatar,
  Paper,
} from '@mui/material';
import { LocationOn, FiberManualRecord, Star, VerifiedUser } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getOperatorReviews } from '@/lib/api/trips';
import type { Trip, Seat, SeatLayout, OperatorReviewsResponse } from '../../types/TripTypes';
import { formatCurrency, formatTime, calculateDuration } from '../../lib/utils/format';
import SeatMap from './SeatMap';
import { PointSelector } from '../booking/PointSelector';

const mapBusTypeToLabel = (type?: string) => {
  if (!type) return '';
  const map: Record<string, string> = {
    standard: 'Ghế ngồi',
    sleeper: 'Giường nằm',
    limousine: 'Limousine',
  };
  return map[type.toLowerCase()] || type;
};

// --- CONSTANTS ---
const REVIEW_PAGE_LIMIT = 5;

interface OperatorReviewsBlockProps {
  operatorId: string;
  isOpen: boolean;
}

// --- REVIEW COMPONENT ---
const OperatorReviewsBlock: React.FC<OperatorReviewsBlockProps> = ({ operatorId, isOpen }) => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery<OperatorReviewsResponse>({
    queryKey: ['operator-reviews', operatorId, page, REVIEW_PAGE_LIMIT],
    queryFn: () => getOperatorReviews(operatorId, page, REVIEW_PAGE_LIMIT),
    enabled: isOpen && !!operatorId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Không tải được đánh giá.
      </Alert>
    );
  }

  const formatName = (email: string) => {
    if (!email) return 'Người dùng';
    const namePart = email.split('@')[0];
    return namePart.replace(/[._]/g, ' ');
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* 1. REVIEW SUMMARY HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 4 }}>
        {/* Big Score Box */}
        <Box sx={{ textAlign: 'center', minWidth: 100 }}>
          <Typography variant="h3" fontWeight={800} color="warning.main" lineHeight={1}>
            {data.averageRating?.toFixed(1)}
          </Typography>
          <Rating
            value={data.averageRating}
            precision={0.1}
            readOnly
            size="small"
            sx={{ my: 0.5 }}
          />
          <Typography variant="caption" color="text.secondary" display="block">
            {data.totalReviews} đánh giá
          </Typography>
        </Box>

        {/* Simple Progress/Stats */}
        <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" sx={{ minWidth: 100 }}>
                Chất lượng dịch vụ
              </Typography>
              <Rating value={data.averageRating} precision={0.5} readOnly size="small" />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" sx={{ minWidth: 100 }}>
                Thái độ nhân viên
              </Typography>
              <Rating
                value={data.averageRating > 0.5 ? data.averageRating - 0.2 : 4.5}
                precision={0.5}
                readOnly
                size="small"
              />
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* 2. REVIEWS LIST */}
      <Box>
        {data.reviews && data.reviews.length > 0 ? (
          <Stack spacing={2}>
            {data.reviews.map((r) => (
              <Paper
                key={r.id}
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: '#fff',
                  border: '1px solid #eee',
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar
                    alt={r.userEmail}
                    sx={{
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {r.userEmail?.[0]?.toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {formatName(r.userEmail)}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                          <Chip
                            icon={<VerifiedUser sx={{ fontSize: '14px !important' }} />}
                            label="Đã đi"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.65rem', '& .MuiChip-label': { px: 1 } }}
                          />
                        </Stack>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Rating value={r.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary" display="block">
                          {new Date(r.submittedAt).toLocaleDateString('vi-VN')}
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography
                      variant="body2"
                      sx={{ mt: 1.5, color: 'text.primary', lineHeight: 1.6 }}
                    >
                      {r.comment}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
            Chưa có đánh giá nào.
          </Typography>
        )}

        {/* 3. PAGINATION */}
        {data.pagination && data.pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={data.pagination.totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              color="primary"
              shape="rounded"
              size="small"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

// --- MAIN TRIP CARD COMPONENT ---

interface TripCardProps {
  trip: Trip;
  isDetailsOpen: boolean;
  isBookingOpen: boolean;
  activeTab: number;
  selectedSeats: Seat[];
  selectedPickup: string;
  selectedDropoff: string;
  seatLayout: SeatLayout | null | undefined;
  isLoadingSeats: boolean;
  isSeatError: boolean;
  isLocking: boolean;
  onToggleDetails: () => void;
  onToggleBooking: () => void;
  onSeatSelect: (seat: Seat) => void;
  onPickupChange: (val: string) => void;
  onDropoffChange: (val: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

const TripCard: React.FC<TripCardProps> = ({
  trip,
  isDetailsOpen,
  isBookingOpen,
  activeTab,
  selectedSeats,
  selectedPickup,
  selectedDropoff,
  seatLayout,
  isLoadingSeats,
  isSeatError,
  isLocking,
  onToggleDetails,
  onToggleBooking,
  onSeatSelect,
  onPickupChange,
  onDropoffChange,
  onContinue,
  onBack,
}) => {
  const { operator, schedules, pricing, availability, bus, from, to, duration } = trip;

  const departureTime = schedules?.departureTime;
  const arrivalTime = schedules?.arrivalTime;
  const fromName = from?.name || 'Điểm đi';
  const toName = to?.name || 'Điểm đến';

  // Pricing Logic
  const hasDiscount = pricing.discount > 0 && pricing.discount < pricing.original;
  const displayPrice = hasDiscount ? pricing.discount : pricing.original;
  const discountPercent = hasDiscount
    ? Math.round(((pricing.original - pricing.discount) / pricing.original) * 100)
    : 0;

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease-in-out',
        border: '1px solid #f0f0f0',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          borderColor: 'primary.main',
        },
        cursor: 'pointer',
      }}
      role="button"
      tabIndex={0}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '65% 35%' },
          }}
        >
          {/* --- COLUMN 1: IMAGE & TIME/ROUTE --- */}
          <Box>
            <Stack direction="row" spacing={2}>
              {/* Bus Image */}
              <Box
                component="img"
                src={operator.image}
                alt={operator.name}
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 2,
                  objectFit: 'cover',
                  display: { xs: 'none', sm: 'block' },
                }}
              />

              {/* Time & Route Diagram */}
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    {operator.name}
                  </Typography>

                  <Star sx={{ fontSize: 16, color: '#FFC107' }} />
                  <Typography variant="body2" fontWeight={600}>
                    {operator.ratings.overall}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({operator.ratings.reviews} đánh giá)
                  </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.25 }}
                  >
                    {mapBusTypeToLabel(bus.type)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                    {availability.totalSeats}
                  </Typography>
                </Stack>

                {/* Vertical Timeline */}
                <Box sx={{ position: 'relative', pl: 2, borderLeft: '2px dotted #e0e0e0' }}>
                  {/* Departure */}
                  <Box sx={{ position: 'relative', mb: 3 }}>
                    <FiberManualRecord
                      sx={{
                        position: 'absolute',
                        left: -21,
                        top: 4,
                        fontSize: 14,
                        color: 'primary.main',
                        bgcolor: 'white',
                      }}
                    />
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Typography variant="h6" fontWeight={700} lineHeight={1}>
                        {formatTime(departureTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.2 }}>
                        • {fromName}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Duration Label */}
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'text.disabled',
                      position: 'absolute',
                      left: 10,
                      top: '35%',
                    }}
                  >
                    {calculateDuration(duration)}
                  </Typography>

                  {/* Arrival */}
                  <Box sx={{ position: 'relative' }}>
                    <LocationOn
                      sx={{
                        position: 'absolute',
                        left: -22,
                        top: 0,
                        fontSize: 16,
                        color: 'error.main',
                        bgcolor: 'white',
                      }}
                    />
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Typography variant="h6" fontWeight={700} lineHeight={1}>
                        {formatTime(arrivalTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.2 }}>
                        • {toName}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* --- COLUMN 2: PRICE & ACTION --- */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'flex-end' },
              minWidth: 180,
            }}
          >
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              {hasDiscount ? (
                <>
                  <Typography variant="h5" fontWeight={800} color="error.main" lineHeight={1.2}>
                    {formatCurrency(displayPrice)}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      {formatCurrency(pricing.original)}
                    </Typography>
                    <Chip
                      label={`-${discountPercent}%`}
                      color="error"
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                    />
                  </Box>
                </>
              ) : (
                <Typography variant="h5" fontWeight={800} color="primary.main">
                  {formatCurrency(displayPrice)}
                </Typography>
              )}
            </Box>

            <Typography variant="body2" sx={{ mt: 0.5, mb: 1.5 }}>
              Còn{' '}
              <Box component="span" fontWeight="bold" color="success.main">
                {availability.availableSeats}
              </Box>{' '}
              chỗ trống
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Typography
                variant="body2"
                color="primary"
                sx={{
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 500,
                  '&:hover': { color: 'primary.dark' },
                }}
                onClick={onToggleDetails}
              >
                Thông tin chi tiết
              </Typography>

              <Button
                variant="contained"
                size="medium"
                onClick={onToggleBooking}
                sx={{
                  bgcolor: '#ffc107',
                  color: '#000',
                  fontWeight: 700,
                  boxShadow: 'none',
                  minWidth: 120,
                  '&:hover': {
                    bgcolor: '#ffb300',
                    boxShadow: '0 2px 8px rgba(255, 193, 7, 0.4)',
                  },
                }}
              >
                {isBookingOpen ? 'Đóng' : 'Chọn chuyến'}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* --- Extended Panes --- */}
        <Collapse in={!!isDetailsOpen || !!isBookingOpen} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />

          {/* === DETAIL VIEW (Updated Layout) === */}
          {isDetailsOpen && (
            <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              {/* TOP ROW: Image + Info (Flexbox) */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 3,
                  mb: 3,
                }}
              >
                {/* Image - Fixed width on Desktop */}
                <Box sx={{ width: { xs: '100%', md: 240 }, flexShrink: 0 }}>
                  {operator.image && (
                    <Box
                      component="img"
                      src={operator.image}
                      alt="Bus"
                      sx={{
                        width: '100%',
                        height: 160,
                        borderRadius: 2,
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </Box>

                {/* Info */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Thông tin nhà xe {trip.operator.name}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Loại xe: {trip.bus.type} - {trip.bus.model}
                  </Typography>

                  <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Tiện ích
                      </Typography>
                      <Stack direction="row" spacing={1} mt={0.5}>
                        <Chip label="Wifi" size="small" />
                        <Chip label="Nước uống" size="small" />
                        <Chip label="Điều hòa" size="small" />
                      </Stack>
                    </Box>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    *Chính sách hủy vé: Hành khách được hoàn 100% vé nếu hủy trước 24h.
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* BOTTOM ROW: Reviews (Full Width) */}
              <Box>
                <OperatorReviewsBlock operatorId={trip.operator.id} isOpen={isDetailsOpen} />
              </Box>
            </Box>
          )}

          {/* === BOOKING VIEW (Unchanged) === */}
          {isBookingOpen && (
            <>
              <Tabs value={activeTab} sx={{ mb: 2, pointerEvents: 'none' }}>
                <Tab label="1. Chọn chỗ" />
                <Tab label="2. Điểm đón/trả" disabled={selectedSeats.length === 0} />
              </Tabs>

              <Box sx={{ minHeight: 300, position: 'relative' }}>
                {isLoadingSeats ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 300,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : isSeatError || !seatLayout ? (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Không thể tải sơ đồ ghế. Vui lòng thử lại sau.
                  </Alert>
                ) : (
                  <>
                    <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
                      <SeatMap
                        layout={seatLayout}
                        selectedSeats={selectedSeats}
                        onSeatToggle={onSeatSelect}
                      />
                    </Box>
                    <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
                      <PointSelector
                        trip={trip}
                        selectedPickup={selectedPickup}
                        selectedDropoff={selectedDropoff}
                        onPickupChange={onPickupChange}
                        onDropoffChange={onDropoffChange}
                      />
                    </Box>
                  </>
                )}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 3,
                  bgcolor: '#f8f9fa',
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ghế đã chọn:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    {selectedSeats.length > 0
                      ? selectedSeats.map((s) => s.seatCode).join(', ')
                      : 'Chưa chọn'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" color="error" fontWeight="bold">
                    {formatCurrency(selectedSeats.reduce((sum, s) => sum + s.price, 0))}
                  </Typography>
                  {activeTab === 1 && (
                    <Button
                      variant="outlined"
                      onClick={onBack}
                      disabled={isLocking}
                      sx={{ minWidth: 100, mr: 1 }}
                    >
                      Quay lại
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onContinue}
                    disabled={selectedSeats.length === 0 || isLoadingSeats}
                    sx={{ mt: 0.5 }}
                  >
                    {activeTab === 0 ? 'Tiếp tục' : 'Xác nhận đặt vé'}
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default TripCard;
