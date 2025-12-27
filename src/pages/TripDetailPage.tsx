import React, { useState, useMemo } from 'react';
import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Stack,
  CircularProgress,
  Alert,
  Container,
  Button,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  Radio,
  Divider,
  Chip,
} from '@mui/material';
import { Search, SwapVert, LocationOn, MyLocation } from '@mui/icons-material';
import { format } from 'date-fns';

// API & Route
import { getTripById } from '@/lib/api/trips';
import { tripDetailRoute } from '@/routes/tripDetailRoute';

// Custom Components
import Header from '@/components/layout/Header';
import TripHeader from '@/components/trip-detail/TripHeader';
import TripAmenities from '@/components/trip-detail/TripAmenities';
import TripSchedule from '@/components/trip-detail/TripSchedule';
import BookingSidebar from '@/components/trip-detail/BookingSidebar';

// Types (Inferred from backend response)
interface StopPoint {
  stopId: string;
  name: string;
  address: string;
  type: 'PICKUP' | 'DROPOFF';
  time: string; // ISO string
}

const PointSelector = ({
  title,
  points = [],
  selectedId,
  onSelect,
  icon,
}: {
  title: string;
  points: StopPoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  icon: React.ReactNode;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter & Sort Logic
  const processedPoints = useMemo(() => {
    let result = [...points];

    // 1. Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerTerm) || p.address.toLowerCase().includes(lowerTerm),
      );
    }

    // 2. Sort
    result.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [points, searchTerm, sortOrder]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        {icon}
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Chip
          label={selectedId ? 'Đã chọn' : 'Bắt buộc'}
          color={selectedId ? 'success' : 'error'}
          size="small"
          variant={selectedId ? 'filled' : 'outlined'}
        />
      </Stack>

      {/* Search & Sort Controls */}
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          size="small"
          placeholder="Tìm điểm đón/trả..."
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          size="small"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          sx={{ minWidth: 140 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SwapVert fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="asc">Sớm nhất</MenuItem>
          <MenuItem value="desc">Muộn nhất</MenuItem>
        </TextField>
      </Stack>

      {/* Points List */}
      <Box sx={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #eee', borderRadius: 2 }}>
        {processedPoints.length > 0 ? (
          processedPoints.map((point, index) => {
            const isSelected = selectedId === point.stopId;
            return (
              <React.Fragment key={point.stopId}>
                {index > 0 && <Divider />}
                <Box
                  onClick={() => onSelect(point.stopId)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    bgcolor: isSelected ? 'primary.50' : 'background.paper',
                    '&:hover': { bgcolor: 'grey.50' },
                    transition: 'all 0.2s',
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Radio checked={isSelected} size="small" sx={{ mt: 0 }} />
                    <Box flex={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography
                          fontWeight={700}
                          color={isSelected ? 'primary.main' : 'text.primary'}
                        >
                          {format(new Date(point.time), 'HH:mm')}
                        </Typography>
                        {isSelected && (
                          <Typography variant="caption" color="primary" fontWeight="bold">
                            Đang chọn
                          </Typography>
                        )}
                      </Stack>

                      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                        {point.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {point.address}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </React.Fragment>
            );
          })
        ) : (
          <Box p={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Không tìm thấy kết quả phù hợp.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const TripDetailPage: React.FC = () => {
  const { tripId } = useParams({ from: tripDetailRoute.id });
  const [selectedPickupId, setSelectedPickupId] = useState<string | null>(null);
  const [selectedDropoffId, setSelectedDropoffId] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  const {
    data: trip,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => getTripById(tripId),
    enabled: !!tripId,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (isError || !trip || !trip.operator) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">
          Dữ liệu chuyến không khả dụng.
          {trip && !trip.operator && ' (Dữ liệu nhận về sai định dạng)'}
        </Alert>
        <Button onClick={() => window.history.back()}>Quay lại</Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 10 }}>
      <Header />

      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
        <TripHeader trip={trip} />
      </Box>

      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4} alignItems="flex-start">
          <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
            <TripAmenities trip={trip} />

            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={0}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Điểm đón & Trả
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Vui lòng chọn điểm đón và điểm trả trước khi tiếp tục đặt vé.
              </Typography>

              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="pickup dropoff tabs">
                  <Tab
                    label="Điểm đón"
                    icon={<MyLocation fontSize="small" />}
                    iconPosition="start"
                    sx={{ fontWeight: 600 }}
                  />
                  <Tab
                    label="Điểm trả"
                    icon={<LocationOn fontSize="small" />}
                    iconPosition="start"
                    sx={{ fontWeight: 600 }}
                  />
                </Tabs>
              </Box>

              {tabIndex === 0 && (
                <PointSelector
                  title="Chọn điểm đón"
                  icon={<MyLocation color="primary" />}
                  points={trip.pickupPoints || []}
                  selectedId={selectedPickupId}
                  onSelect={(id) => {
                    setSelectedPickupId(id);
                    if (!selectedDropoffId) {
                      setTimeout(() => setTabIndex(1), 300);
                    }
                  }}
                />
              )}

              {tabIndex === 1 && (
                <PointSelector
                  title="Chọn điểm trả"
                  icon={<LocationOn color="secondary" />}
                  points={trip.dropoffPoints || []}
                  selectedId={selectedDropoffId}
                  onSelect={setSelectedDropoffId}
                />
              )}
            </Paper>

            <TripSchedule trip={trip} />
          </Box>

          <Box sx={{ width: { xs: '100%', lg: '380px' }, flexShrink: 0 }}>
            <BookingSidebar
              trip={trip}
              selectedPickupId={selectedPickupId}
              selectedDropoffId={selectedDropoffId}
              bookingDisabled={!selectedPickupId || !selectedDropoffId}
            />

            {(!selectedPickupId || !selectedDropoffId) && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Vui lòng chọn điểm đón và điểm trả để tiếp tục.
              </Alert>
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default TripDetailPage;
