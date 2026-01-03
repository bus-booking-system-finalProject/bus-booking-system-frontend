// src/components/admin/analytics/AnalyticsFilter.tsx
import React from 'react';
import { Box, TextField, Stack, Button } from '@mui/material';

interface AnalyticsFilterProps {
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
}

export const AnalyticsFilter: React.FC<AnalyticsFilterProps> = ({
  startDate,
  endDate,
  onDateChange,
}) => {
  // Helpers for quick ranges
  const handleRangeSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    onDateChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
      <TextField
        label="From Date"
        type="date"
        size="small"
        value={startDate}
        onChange={(e) => onDateChange(e.target.value, endDate)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="To Date"
        type="date"
        size="small"
        value={endDate}
        onChange={(e) => onDateChange(startDate, e.target.value)}
        InputLabelProps={{ shrink: true }}
      />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" size="small" onClick={() => handleRangeSelect(7)}>
          7 days
        </Button>
        <Button variant="outlined" size="small" onClick={() => handleRangeSelect(30)}>
          30 days
        </Button>
      </Box>
    </Stack>
  );
};
