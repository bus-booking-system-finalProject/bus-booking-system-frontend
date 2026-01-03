// src/components/admin/analytics/SummaryStatsGrid.tsx
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  AttachMoney,
  ConfirmationNumber,
  PendingActions,
  Cancel,
  ConfirmationNumberOutlined,
  CheckCircle, // Import icon for Completed
} from '@mui/icons-material';
import { type AnalyticsSummary } from '@/types/analytics';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}> = ({ title, value, icon, color, bgColor }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      },
    }}
  >
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        bgcolor: bgColor,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {title}
      </Typography>
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

export const SummaryStatsGrid: React.FC<{ data?: AnalyticsSummary }> = ({ data }) => {
  if (!data) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <Box sx={{ mb: 4 }}>
      {/* First row with 2 cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr',
            xl: '1fr 1fr',
          },
          gap: 3,
          mb: 3,
        }}
      >
        {/* 1. Total Revenue */}
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          icon={<AttachMoney fontSize="large" />}
          color="#10B981"
          bgColor="#D1FAE5"
        />
        {/* 2. Total Tickets */}
        <StatCard
          title="Total Tickets"
          value={data.totalTickets}
          icon={<ConfirmationNumber fontSize="large" />}
          color="#3B82F6"
          bgColor="#DBEAFE"
        />
      </Box>

      {/* Second row with 4 cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: 'repeat(4, 1fr)',
            xl: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {/* 3. Confirmed */}
        <StatCard
          title="Confirmed"
          value={data.confirmedTickets}
          icon={<ConfirmationNumberOutlined fontSize="large" />}
          color="#6366F1"
          bgColor="#E0E7FF"
        />
        {/* 4. Completed */}
        <StatCard
          title="Completed"
          value={data.completedTickets}
          icon={<CheckCircle fontSize="large" />}
          color="#06B6D4"
          bgColor="#CFFAFE"
        />
        {/* 5. Pending */}
        <StatCard
          title="Pending"
          value={data.pendingTickets}
          icon={<PendingActions fontSize="large" />}
          color="#F59E0B"
          bgColor="#FEF3C7"
        />
        {/* 6. Cancelled */}
        <StatCard
          title="Cancelled"
          value={data.cancelledTickets}
          icon={<Cancel fontSize="large" />}
          color="#EF4444"
          bgColor="#FEE2E2"
        />
      </Box>
    </Box>
  );
};
