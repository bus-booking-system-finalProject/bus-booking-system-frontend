import React from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Breadcrumbs,
  Link,
  CircularProgress,
  Stack,
  Fade,
  Grid,
} from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import SummaryCards from './SummaryCards';
import ActivityList from './ActivityList';
import RoleAdaptiveWidget from './RoleAdaptiveWidget';
import { useAuth } from '@/hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#f2f7f9',
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: '#0060c4' }} />
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#f2f7f9',
          pb: 8,
          pt: 4,
        }}
      >
        <Container maxWidth="xl">
          {/* HEADER SECTION (Giữ nguyên) */}
          <Box sx={{ mb: 4 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
              <Link
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}
                href="/"
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Trang chủ
              </Link>
              <Typography
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.primary',
                  fontWeight: 500,
                }}
              >
                <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Dashboard
              </Typography>
            </Breadcrumbs>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  color: '#1a1a1a',
                  letterSpacing: '-0.5px',
                }}
              >
                Tổng quan
              </Typography>

              {user?.role && (
                <Chip
                  icon={<VerifiedUserIcon />}
                  label={user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                  sx={{
                    fontWeight: 700,
                    bgcolor: user.role === 'ADMIN' ? '#ffebee' : '#e3f2fd',
                    color: user.role === 'ADMIN' ? '#d32f2f' : '#0060c4',
                    border: '1px solid',
                    borderColor: 'transparent',
                  }}
                />
              )}
            </Stack>
          </Box>

          <Box sx={{ mb: 4 }}>
            <SummaryCards />
          </Box>

          {/* 2. MAIN GRID LAYOUT (Đã sửa lỗi) */}
          <Grid container spacing={3}>
            {/* THAY ĐỔI QUAN TRỌNG:
               1. Bỏ prop 'item'
               2. Chuyển các props xs, md, lg vào trong prop 'size'
            */}

            {/* Cột trái: Activity List */}
            <Grid size={{ xs: 12, md: 8, lg: 9 }}>
              <Box sx={{ height: '100%', minHeight: '400px' }}>
                <ActivityList />
              </Box>
            </Grid>

            {/* Cột phải: Role Widget */}
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <Box sx={{ height: '100%' }}>
                <RoleAdaptiveWidget />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Fade>
  );
};

export default Dashboard;
