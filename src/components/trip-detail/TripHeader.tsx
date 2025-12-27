import React from 'react';
import { Box, Stack, Typography, Chip, Rating } from '@mui/material';
import { VerifiedUser } from '@mui/icons-material';
import { type Trip } from '@/types/TripTypes';

interface TripHeaderProps {
  trip: Trip;
}

const TripHeader: React.FC<TripHeaderProps> = ({ trip }) => {
  // Safety check to prevent crash if operator is missing
  const operatorName = trip?.operator?.name || 'Unknown Operator';
  const busType = trip?.bus?.type || 'standard';

  const getBusTypeLabel = (type?: string) => {
    if (!type) return '';
    switch ((type || '').toLowerCase()) {
      case 'sleeper':
        return 'Giường nằm';
      case 'limousine':
        return 'Limousine';
      case 'standard':
      default:
        return 'Ghế ngồi';
    }
  };
  const price = trip?.pricing?.original || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #e0e0e0',
        py: 2,
        mb: 3,
        mt: 1,
        borderRadius: 2,
        border: '1px solid #eee',
      }}
    >
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'flex-end' }}
          spacing={2}
        >
          {/* Left: Operator Info with bus image */}

          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              component="img"
              src={
                trip?.bus?.images?.[0] ||
                'https://images.unsplash.com/photo-1532939163844-547f958e91b4?auto=format&fit=crop&q=80&w=300'
              }
              alt={operatorName}
              sx={{
                width: 120,
                height: 120,
                borderRadius: 2,
                objectFit: 'cover',
                display: { xs: 'none', sm: 'block' },
              }}
            />

            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1a1a1a' }}>
                {operatorName}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Rating value={trip.rating || 4.5} readOnly precision={0.5} size="small" />
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    {trip.rating || 4.5}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({trip.review_count || 100} reviews)
                  </Typography>
                </Stack>

                <Chip
                  label={getBusTypeLabel(busType)}
                  size="small"
                  color="primary"
                  variant="filled"
                  sx={{ borderRadius: '4px', fontWeight: 600 }}
                />

                <Chip
                  icon={<VerifiedUser sx={{ fontSize: 14 }} />}
                  label="Đã xác minh"
                  size="small"
                  sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, border: 'none' }}
                />
              </Stack>
            </Box>
          </Stack>

          {/* Right: Price */}
          <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textDecoration: 'line-through' }}
            >
              {formatCurrency(price * 1.2)}
            </Typography>
            <Typography variant="h4" color="secondary.main" fontWeight={800}>
              {formatCurrency(price)}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default TripHeader;
