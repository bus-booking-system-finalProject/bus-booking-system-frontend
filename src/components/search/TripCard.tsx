import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Stack,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  DirectionsBus,
  LocationOn,
  FiberManualRecord,
  Star,
  Wifi,
  AcUnit,
  LocalDrink,
  VerifiedUser,
} from '@mui/icons-material';
import { type Trip } from '@/types/trip';
import { useNavigate } from '@tanstack/react-router';

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const calculateDuration = (start: string, end: string) => {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const diffMs = endTime - startTime;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
};

const mapBusTypeToLabel = (type?: string) => {
  if (!type) return '';
  const map: Record<string, string> = {
    standard: 'Seater',
    sleeper: 'Sleeper',
    limousine: 'Limousine',
  };
  return map[type.toLowerCase()] || type;
};

interface TripCardProps {
  trip: Trip;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const navigate = useNavigate();
  // click handler
  const handleSelectTrip = () => {
    navigate({
      to: '/trip/$tripId',
      params: { tripId: trip.tripId },
    });
  };

  // Destructure based on the Trip type from trip.ts
  const {
    operator,
    route,
    schedule,
    pricing,
    availability,
    bus,
    rating = 4.5,
    review_count = 100,
  } = trip;

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
      onClick={handleSelectTrip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelectTrip();
        }
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box
          sx={{
            display: 'grid',
            // FIX:
            // 32% for First Column (Tightens the gap)
            // 1fr for Middle (Takes remaining space, pushes 3rd col to far right)
            // 25% for Last Column (Keeps price aligned right)
            gridTemplateColumns: { xs: '1fr', md: '42% 35% 20%' },
            gap: 2, // Adds space between columns
          }}
        >
          {/* --- COLUMN 1: IMAGE & TIME/ROUTE --- */}
          <Box>
            <Stack direction="row" spacing={2}>
              {/* Bus Image */}
              <Box
                component="img"
                src={
                  bus.images?.[0] ||
                  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=300'
                }
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
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {operator.name}
                </Typography>

                {/* Rating */}
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
                  <Star sx={{ fontSize: 16, color: '#FFC107' }} />
                  <Typography variant="body2" fontWeight={600}>
                    {rating}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({review_count} đánh giá)
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
                        {formatTime(schedule.departureTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.2 }}>
                        • {route.origin}
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
                    {calculateDuration(schedule.departureTime, schedule.arrivalTime)}
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
                        {formatTime(schedule.arrivalTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.2 }}>
                        • {route.destination}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* --- COLUMN 2: BUS INFO & AMENITIES --- */}
          {/* This box now takes '1fr' so it fills the middle space naturally */}
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#f8f9fa',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* TOP PART: Split Left (Name) and Right (Icons & Chips) */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                {/* Left Side: Bus Name and Capacity */}
                <Stack direction="row" spacing={1}>
                  <DirectionsBus fontSize="small" color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {bus.model}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.25 }}
                    >
                      {mapBusTypeToLabel(bus.type)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {availability.totalSeats} Ghế
                    </Typography>
                  </Box>
                </Stack>

                {/* Right Side: Icons and Chips Stacked Vertically */}
                <Stack alignItems="flex-end" spacing={1}>
                  {/* Icons Row */}
                  <Stack direction="row" spacing={1} sx={{ color: 'text.secondary' }}>
                    <Tooltip title="Wifi">
                      <Wifi fontSize="small" />
                    </Tooltip>
                    <Tooltip title="Nước">
                      <LocalDrink fontSize="small" />
                    </Tooltip>
                    <Tooltip title="Điều hòa">
                      <AcUnit fontSize="small" />
                    </Tooltip>
                  </Stack>

                  {/* Chips Row (Now under the icons) */}
                  <Stack direction="row" spacing={1}>
                    <Chip
                      icon={<VerifiedUser style={{ fontSize: 14 }} />}
                      label="An toàn"
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#e8f5e9', color: '#2e7d32' }}
                    />
                  </Stack>
                </Stack>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              {/* BOTTOM PART: Seat Availability */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Chỗ trống:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={availability.availableSeats < 5 ? 'error.main' : 'success.main'}
                >
                  {availability.availableSeats} chỗ
                </Typography>
              </Stack>
            </Box>
          </Box>

          {/* --- COLUMN 3: PRICE & ACTION --- */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'flex-end' },
            }}
          >
            <Box sx={{ textAlign: { xs: 'left', md: 'right' }, mt: 1 }}>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ textDecoration: 'line-through' }}
              >
                {formatCurrency(pricing.basePrice * 1.2)}
              </Typography>
              <Typography variant="h5" fontWeight={800} color="secondary.main">
                {formatCurrency(pricing.basePrice)}
              </Typography>
              <Chip
                label="Ưu đãi"
                color="error"
                size="small"
                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, mt: 0.5 }}
              />
            </Box>

            <Box sx={{ width: '100%', mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSelectTrip}
                sx={{
                  bgcolor: 'warning.main',
                  color: 'warning.contrastText',
                  fontWeight: 700,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#ffca2c',
                    boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)',
                  },
                }}
              >
                Chọn chuyến
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TripCard;
