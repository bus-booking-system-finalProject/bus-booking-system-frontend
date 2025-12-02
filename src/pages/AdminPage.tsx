import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Chip,
  Breadcrumbs,
  Link,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard'; // Import Dashboard Icon
import { Clock, MapPin, LayoutGrid } from 'lucide-react';
import { TripScheduler } from '@/components/admin/TripScheduler';
import { RouteConfigurator } from '@/components/admin/RouteConfigurator';
import { SeatMapDesigner } from '@/components/admin/SeatMapDesigner';
import { useAdminPageInfo } from '@/context/AdminLayoutContext';

export const AdminPage: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);

  // Consume the context to get dynamic Label and Icon
  const { pageTitle, PageIcon } = useAdminPageInfo();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f2f7f9', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Breadcrumbs: Home > Dashboard > Current Page */}
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}
              href="/"
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Trang chủ
            </Link>

            <Link
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}
              href="/admin/dashboard"
            >
              <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>

            <Typography
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.primary',
                fontWeight: 600,
              }}
            >
              {PageIcon && <PageIcon size={18} style={{ marginRight: 6 }} />}
              {pageTitle}
            </Typography>
          </Breadcrumbs>

          <Chip
            label="Authenticated: Super Admin"
            color="secondary"
            size="small"
            variant="outlined"
          />
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            indicatorColor="secondary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab icon={<Clock size={20} />} iconPosition="start" label="Trip Scheduling" />
            <Tab icon={<MapPin size={20} />} iconPosition="start" label="Route Config" />
            <Tab icon={<LayoutGrid size={20} />} iconPosition="start" label="Seat Maps" />
          </Tabs>
        </Paper>

        <Box sx={{ py: 2 }}>
          {tabIndex === 0 && <TripScheduler />}
          {tabIndex === 1 && <RouteConfigurator />}
          {tabIndex === 2 && <SeatMapDesigner />}
        </Box>
      </Container>
    </Box>
  );
};

export default AdminPage;
