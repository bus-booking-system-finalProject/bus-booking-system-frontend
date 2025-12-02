import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { MapPin, Bus as BusIcon, User, Loader2 } from 'lucide-react';
import type { ScheduleFormData } from '@/types/AdminTypes';
import { useAdminRoutes, useAdminBuses, useCreateTripMutation } from '@/hooks/useAdminQueries';

export const TripScheduler: React.FC = () => {
  // 1. Data Fetching via TanStack Query
  const {
    data: routes = [],
    isLoading: isLoadingRoutes,
    isError: isRoutesError,
  } = useAdminRoutes();
  const { data: buses = [], isLoading: isLoadingBuses, isError: isBusesError } = useAdminBuses();

  // 2. Mutation Hook
  const createTrip = useCreateTripMutation();

  const [formData, setFormData] = useState<ScheduleFormData>({
    routeId: '',
    busId: '',
    depDate: '',
    arrDate: '',
    price: '',
    capacity: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>,
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    createTrip.mutate(formData);
  };

  // Derived state for preview
  const selectedRoute = routes.find((r) => r.id.toString() === formData.routeId);
  const selectedBus = buses.find((b) => b.id.toString() === formData.busId);

  // Loading / Error Handling
  if (isLoadingRoutes || isLoadingBuses) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isRoutesError || isBusesError) {
    return <Alert severity="error">Failed to load configuration data.</Alert>;
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Form Column */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create New Trip Segment
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Route</InputLabel>
                  <Select
                    name="routeId"
                    value={formData.routeId}
                    label="Select Route"
                    onChange={handleChange}
                  >
                    {routes.map((r) => (
                      <MenuItem key={r.id} value={r.id.toString()}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Assign Bus</InputLabel>
                  <Select
                    name="busId"
                    value={formData.busId}
                    label="Assign Bus"
                    onChange={handleChange}
                  >
                    {buses.map((b) => (
                      <MenuItem key={b.id} value={b.id.toString()}>
                        {b.name} ({b.capacity} seats)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Departure Time"
                  type="datetime-local"
                  name="depDate"
                  InputLabelProps={{ shrink: true }}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Arrival Time"
                  type="datetime-local"
                  name="arrDate"
                  InputLabelProps={{ shrink: true }}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Base Price ($)"
                  type="number"
                  name="price"
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Total Capacity"
                  type="number"
                  name="capacity"
                  value={selectedBus ? selectedBus.capacity : formData.capacity}
                  onChange={handleChange}
                  helperText="Defaults to bus max capacity"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleCreate}
                    disabled={createTrip.isPending}
                    startIcon={
                      createTrip.isPending ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : undefined
                    }
                  >
                    {createTrip.isPending ? 'Creating...' : 'Create Schedule'}
                  </Button>
                  <Button variant="outlined" size="large" disabled={createTrip.isPending}>
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Preview Column */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              height: '100%',
              bgcolor: '#f1f5f9',
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: '#cbd5e1',
            }}
          >
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Live Preview
              </Typography>
              <Typography variant="h5" gutterBottom>
                {selectedRoute?.name || 'No Route Selected'}
              </Typography>

              <Stack spacing={2} sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <MapPin size={20} className="text-blue-500" />
                  <Typography variant="body2">
                    <strong>Origin:</strong> {selectedRoute?.origin || '--'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <MapPin size={20} className="text-red-500" />
                  <Typography variant="body2">
                    <strong>Destination:</strong> {selectedRoute?.destination || '--'}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <BusIcon size={20} />
                  <Typography variant="body2">
                    <strong>Vehicle:</strong> {selectedBus?.model || '--'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <User size={20} />
                  <Typography variant="body2">
                    <strong>Capacity:</strong> {selectedBus?.capacity || '--'} Pax
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
