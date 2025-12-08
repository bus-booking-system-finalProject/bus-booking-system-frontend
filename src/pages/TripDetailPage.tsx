// src/pages/TripDetailPage.tsx
import React from 'react';
import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Box, Stack, CircularProgress, Alert, Container, Button } from '@mui/material';

// API & Route
import { getTripById } from '@/lib/api/trips';
import { tripDetailRoute } from '@/routes/tripDetailRoute';

// Custom Components
import Header from '@/components/layout/Header';
import TripHeader from '@/components/trip-detail/TripHeader';
import TripAmenities from '@/components/trip-detail/TripAmenities';
import TripSchedule from '@/components/trip-detail/TripSchedule';
import BookingSidebar from '@/components/trip-detail/BookingSidebar';

const TripDetailPage: React.FC = () => {
  // 1. Get ID from URL
  const { tripId } = useParams({ from: tripDetailRoute.id });

  const {
    data: trip,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => getTripById(tripId),
    enabled: !!tripId,
  });

  // 3. Loading State
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  // 4. Error State or Missing Data
  // FIX: Explicitly check for trip AND trip.operator to avoid "undefined reading name" error
  if (isError || !trip || !trip.operator) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">
          Dữ liệu chuyến không khả dụng.
          {/* Debugging helper: */}
          {trip && !trip.operator && ' (Dữ liệu nhận về sai định dạng)'}
        </Alert>
        <Button onClick={() => window.history.back()}>Quay lại</Button>
      </Container>
    );
  }

  // 5. Success State
  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 10 }}>
      <Header />

      {/* Top Header Section */}
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
        <TripHeader trip={trip} />
      </Box>

      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
        {/* Layout: Flex Row to replace Grid */}
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4} alignItems="flex-start">
          {/* LEFT COLUMN (Main Content) - Takes remaining space */}
          <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
            <TripAmenities trip={trip} />
            <TripSchedule trip={trip} />
          </Box>

          {/* RIGHT COLUMN (Sidebar) - Fixed width on Desktop */}
          <Box sx={{ width: { xs: '100%', lg: '380px' }, flexShrink: 0 }}>
            <BookingSidebar trip={trip} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default TripDetailPage;
