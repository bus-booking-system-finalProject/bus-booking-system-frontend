import React from 'react';
import { Paper, Box, Typography, Stack } from '@mui/material';
import { LocationOn, RadioButtonChecked } from '@mui/icons-material';
import { type Trip } from '@/types/TripTypes';

const TripSchedule: React.FC<{ trip: Trip }> = ({ trip }) => {
  const departure = trip?.schedules?.departureTime;
  const arrival = trip?.schedules?.arrivalTime;
  const origin = trip?.route?.origin;
  const destination = trip?.route?.destination;

  const formatTime = (iso?: string) => {
    if (!iso) return '--:--';
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatTimeWithDate = (iso?: string) => {
    if (!iso) return '--:--';
    const time = formatTime(iso);
    const date = new Date(iso);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${time}, ${day}/${month}/${year}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Lịch trình chuyến
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        {formatDate(departure)}
      </Typography>

      <Box sx={{ mt: 4, px: 1 }}>
        {/* Timeline Container */}
        <Box sx={{ position: 'relative', pl: 1 }}>
          {/* Connecting Line */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              bottom: 40,
              left: 18,
              width: '2px',
              bgcolor: '#e0e0e0',
              zIndex: 0,
            }}
          />

          {/* Departure Point */}
          <Stack direction="row" spacing={3} sx={{ mb: 5, position: 'relative', zIndex: 1 }}>
            <Box sx={{ pt: 0.5 }}>
              <RadioButtonChecked color="primary" sx={{ bgcolor: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} lineHeight={1}>
                {formatTimeWithDate(departure)}
              </Typography>
              <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                {origin}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điểm đón
              </Typography>
            </Box>
          </Stack>

          {/* Arrival Point */}
          <Stack direction="row" spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ pt: 0.5 }}>
              <LocationOn color="error" sx={{ bgcolor: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} lineHeight={1}>
                {formatTimeWithDate(arrival)}
              </Typography>
              <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                {destination}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điểm trả
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export default TripSchedule;
