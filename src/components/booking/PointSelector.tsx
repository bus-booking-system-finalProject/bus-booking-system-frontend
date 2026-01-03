import React from 'react';
import { Box, Typography, Radio, Grid } from '@mui/material';
import type { Trip, StopPoint } from '../../types/TripTypes';

interface PointSelectorProps {
  trip: Trip;
  selectedPickup: string;
  selectedDropoff: string;
  onPickupChange: (id: string) => void;
  onDropoffChange: (id: string) => void;
}

// Helper: Calculate stop time from departure + duration offset
const calculateStopTime = (departureTime: string, durationMinutes: number): string => {
  const departure = new Date(departureTime);
  departure.setMinutes(departure.getMinutes() + durationMinutes);
  return departure.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

export const PointSelector: React.FC<PointSelectorProps> = ({
  trip,
  selectedPickup,
  selectedDropoff,
  onPickupChange,
  onDropoffChange,
}) => {
  const departureTime = trip.schedules?.departureTime;

  const renderPoint = (point: StopPoint, isPickup: boolean) => {
    const stopTime = departureTime ? calculateStopTime(departureTime, 0) : '';

    return (
      <Box
        key={point.stopId}
        sx={{
          display: 'flex',
          mb: 2,
          alignItems: 'flex-start',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
          p: 1,
          borderRadius: 1,
        }}
        onClick={() => (isPickup ? onPickupChange(point.stopId) : onDropoffChange(point.stopId))}
      >
        <Radio
          checked={isPickup ? selectedPickup === point.stopId : selectedDropoff === point.stopId}
          size="small"
          sx={{ mt: -0.5, mr: 1 }}
        />
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            {stopTime} • {point.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {point.address}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Grid container spacing={4}>
        {/* Updated syntax: size={{ xs: 12, md: 6 }} */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
            Điểm đón
          </Typography>
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {trip.route.pickup_points?.map((p) => renderPoint(p, true))}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
            Điểm trả
          </Typography>
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {trip.route.dropoff_points?.map((p) => renderPoint(p, false))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
