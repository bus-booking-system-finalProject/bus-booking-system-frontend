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
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr', // 1 card per row (Mobile)
          sm: '1fr 1fr', // 2 cards per row (Tablet)
          md: 'repeat(3, 1fr)', // 3 cards per row (Desktop - 2 rows total)
          xl: 'repeat(6, 1fr)', // 6 cards per row (Wide Screens - 1 row total)
        },
        gap: 3,
        mb: 4,
      }}
    >
      {/* 1. DOANH THU */}
      <StatCard
        title="Doanh thu"
        value={formatCurrency(data.totalRevenue)}
        icon={<AttachMoney fontSize="large" />}
        color="#10B981" // Emerald 500
        bgColor="#D1FAE5" // Emerald 100
      />

      {/* 2. TỔNG VÉ */}
      <StatCard
        title="Tổng vé"
        value={data.totalTickets}
        icon={<ConfirmationNumber fontSize="large" />}
        color="#3B82F6" // Blue 500
        bgColor="#DBEAFE" // Blue 100
      />

      {/* 3. ĐÃ THANH TOÁN (Confirmed) */}
      <StatCard
        title="Đã thanh toán"
        value={data.confirmedTickets}
        icon={<ConfirmationNumberOutlined fontSize="large" />}
        color="#6366F1" // Indigo 500
        bgColor="#E0E7FF" // Indigo 100
      />

      {/* 4. ĐÃ HOÀN THÀNH (Completed) - NEW */}
      <StatCard
        title="Đã hoàn thành"
        value={data.completedTickets}
        icon={<CheckCircle fontSize="large" />}
        color="#06B6D4" // Cyan 500
        bgColor="#CFFAFE" // Cyan 100
      />

      {/* 5. CHỜ THANH TOÁN (Pending) */}
      <StatCard
        title="Chờ thanh toán"
        value={data.pendingTickets}
        icon={<PendingActions fontSize="large" />}
        color="#F59E0B" // Amber 500
        bgColor="#FEF3C7" // Amber 100
      />

      {/* 6. ĐÃ HỦY (Cancelled) */}
      <StatCard
        title="Đã hủy"
        value={data.cancelledTickets}
        icon={<Cancel fontSize="large" />}
        color="#EF4444" // Red 500
        bgColor="#FEE2E2" // Red 100
      />
    </Box>
  );
};
