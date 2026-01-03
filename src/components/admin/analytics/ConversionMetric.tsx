// src/components/admin/analytics/ConversionMetric.tsx
import React from 'react';
import { Paper, Typography, Box, Stack, LinearProgress, Divider } from '@mui/material';
import { Search, TouchApp, Percent } from '@mui/icons-material';
import { type ConversionRate } from '@/types/analytics';

export const ConversionMetric: React.FC<{ data?: ConversionRate }> = ({ data }) => {
  if (!data) return null;

  return (
    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Conversion Rate
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', width: 60, height: 60 }}>
          <Typography
            variant="h3"
            component="div"
            color="primary.main"
            fontWeight={800}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {data.conversionRatePercentage}%
          </Typography>
        </Box>
      </Box>

      <Stack spacing={2} sx={{ mt: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Search color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Search counts
            </Typography>
          </Stack>
          <Typography fontWeight={600}>{data.totalSearches}</Typography>
        </Stack>

        <Divider />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <TouchApp color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Ticket bookings
            </Typography>
          </Stack>
          <Typography fontWeight={600}>{data.totalBookings}</Typography>
        </Stack>

        <Box sx={{ pt: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: 'block' }}
          ></Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(data.conversionRatePercentage, 100)}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </Stack>
    </Paper>
  );
};
