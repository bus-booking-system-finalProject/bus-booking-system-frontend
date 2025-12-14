// src/pages/admin/AdminDashboardPage.tsx
import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useAnalytics } from '@/hooks/admin/useAnalytics';
import { AnalyticsFilter } from '@/components/admin/analytics/AnalyticsFilter';
import { SummaryStatsGrid } from '@/components/admin/analytics/SummaryStatsGrid';
import { RevenueChart } from '@/components/admin/analytics/RevenueChart';
import { PopularRoutesTable } from '@/components/admin/analytics/PopularRoutesTable';
import { ConversionMetric } from '@/components/admin/analytics/ConversionMetric';

const AdminDashboardPage: React.FC = () => {
  // Default: Last 30 days
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { summary, trends, popularRoutes, conversion, isLoading, isError } = useAnalytics({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const handleDateChange = (start: string, end: string) => {
    setDateRange({ startDate: start, endDate: end });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Không thể tải dữ liệu thống kê. Vui lòng kiểm tra kết nối hoặc quyền truy cập.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Tổng quan
        </Typography>
        <Typography color="text.secondary">
          Theo dõi hiệu suất kinh doanh và xu hướng đặt vé của hệ thống.
        </Typography>
      </Box>

      {/* 1. Filters */}
      <AnalyticsFilter
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onDateChange={handleDateChange}
      />

      {/* 2. Key Metrics Row */}
      <SummaryStatsGrid data={summary.data} />

      {/* 3. Main Content Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '3fr 1fr' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Left: Revenue Chart (Wide) */}
        <Box sx={{ height: 450 }}>
          <RevenueChart data={trends.data} />
        </Box>

        {/* Right: Conversion Rate (Narrow) */}
        <Box sx={{ height: 450 }}>
          <ConversionMetric data={conversion.data} />
        </Box>
      </Box>

      {/* 4. Bottom Row */}
      <Box sx={{ height: 'auto' }}>
        <PopularRoutesTable data={popularRoutes.data} />
      </Box>
    </Box>
  );
};

export default AdminDashboardPage;
