import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Add, Edit, Delete, CalendarMonth } from '@mui/icons-material';
import { useForm, Controller, type SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseISO, addMinutes, format } from 'date-fns';
import { AxiosError } from 'axios';

import { useSearchTrips, useMutateTrip } from '@/hooks/admin/useTrips';
import { useRoutes } from '@/hooks/admin/useRoutes';
import { useBuses } from '@/hooks/admin/useBuses';

// Types
import type { Trip } from '@/types/AdminTypes';

import { TripSchema, type TripFormValues } from '@/schemas/TripsSchema';

export default function TripsPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // --- QUERIES ---
  const { data: tripResponse, isLoading: tripsLoading } = useSearchTrips({ page: 1, limit: 100 });
  const trips = tripResponse?.data || [];

  const { data: routes = [] } = useRoutes();
  const { data: buses = [] } = useBuses();

  // --- MUTATIONS ---
  const { create, update, delete: remove } = useMutateTrip();

  const { control, handleSubmit, reset, setValue } = useForm<TripFormValues>({
    resolver: zodResolver(TripSchema),
    defaultValues: { status: 'SCHEDULED', basePrice: 0 },
  });

  // --- Auto-Calculate Arrival Time Logic (using useWatch) ---
  const selectedRouteId = useWatch({ control, name: 'routeId' });
  const departureTime = useWatch({ control, name: 'departureTime' });

  useEffect(() => {
    if (selectedRouteId && departureTime) {
      const route = routes.find((r) => r.id === selectedRouteId);
      if (route && route.estimatedMinutes) {
        try {
          const start = parseISO(departureTime);
          const end = addMinutes(start, route.estimatedMinutes);
          if (!isNaN(end.getTime())) {
            setValue('arrivalTime', format(end, "yyyy-MM-dd'T'HH:mm"));
          }
        } catch (e) {
          console.error("Invalid date calculation", e);
        }
      }
    }
  }, [selectedRouteId, departureTime, routes, setValue]);

  // --- Handlers ---
  const handleOpen = (trip?: Trip) => {
    setServerError(null);
    if (trip) {
      setEditingId(trip.id);
      reset({
        routeId: trip.routeId,
        busId: trip.busId,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        basePrice: trip.basePrice,
        status: trip.status,
      });
    } else {
      setEditingId(null);
      reset({
        status: 'SCHEDULED',
        basePrice: 0,
        routeId: '',
        busId: '',
        departureTime: '',
        arrivalTime: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    reset();
  };

  const handleMutationError = (error: Error | AxiosError) => {
    if (error instanceof AxiosError && error.response?.status === 409) {
      setServerError('Bus conflict: This bus is already scheduled during this timeframe.');
    } else {
      setServerError(error.message || 'An error occurred while saving the trip.');
    }
  };

  const onSubmit: SubmitHandler<TripFormValues> = (data) => {
    if (editingId) {
      update.mutate(
        { id: editingId, data }, 
        {
          onSuccess: () => handleClose(),
          onError: (error) => handleMutationError(error),
        }
      );
    } else {
      create.mutate(
        data, 
        {
          onSuccess: () => handleClose(),
          onError: (error) => handleMutationError(error),
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this trip?')) {
      remove.mutate(id);
    }
  };

  // --- Columns ---
  const columns: GridColDef[] = [
    {
      field: 'routeId',
      headerName: 'Route',
      width: 250,
      valueGetter: (_, row) => {
        const r = routes.find((x) => x.id === row.routeId);
        return r ? `${r.origin} → ${r.destination}` : row.routeId;
      },
    },
    {
      field: 'busId',
      headerName: 'Bus',
      width: 200,
      valueGetter: (_, row) => {
        const b = buses.find((x) => x.id === row.busId);
        return b ? `${b.plateNumber} (${b.model})` : row.busId;
      },
    },
    {
      field: 'departureTime',
      headerName: 'Departure',
      width: 180,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value as string).toLocaleString('vi-VN');
      },
    },
    { 
      field: 'basePrice', 
      headerName: 'Price', 
      type: 'number', 
      width: 120,
      valueFormatter: (params) => 
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.value)
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const colors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
          SCHEDULED: 'info',
          COMPLETED: 'success',
          CANCELLED: 'error',
          DELAYED: 'warning',
        };
        return (
          <Chip
            label={params.value}
            color={colors[params.value as string] || 'default'}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton size="small" onClick={() => handleOpen(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (tripsLoading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonth /> Trip Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Schedule Trip
        </Button>
      </Stack>

      <DataGrid
        rows={trips}
        columns={columns}
        autoHeight
        initialState={{ 
          pagination: { paginationModel: { pageSize: 10 } },
          sorting: { sortModel: [{ field: 'departureTime', sort: 'desc' }] } 
        }}
        pageSizeOptions={[10, 25, 50]}
        sx={{ bgcolor: 'white' }}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Trip' : 'Schedule New Trip'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Stack spacing={3}>
              {serverError && <Alert severity="error">{serverError}</Alert>}

              <Controller
                name="routeId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={routes}
                    getOptionLabel={(opt) =>
                      `${opt.origin} - ${opt.destination} (${opt.estimatedMinutes}m)`
                    }
                    value={routes.find((r) => r.id === field.value) || null}
                    onChange={(_, val) => field.onChange(val?.id)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Select Route" 
                        required 
                        error={!!field.value} 
                      />
                    )}
                  />
                )}
              />

              <Controller
                name="busId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={buses}
                    getOptionLabel={(opt) => `${opt.plateNumber} - ${opt.model}`}
                    value={buses.find((b) => b.id === field.value) || null}
                    onChange={(_, val) => field.onChange(val?.id)}
                    renderInput={(params) => <TextField {...params} label="Select Bus" required />}
                  />
                )}
              />

              <Stack direction="row" spacing={2}>
                <Controller
                  name="departureTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="datetime-local"
                      label="Departure"
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
                <Controller
                  name="arrivalTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="datetime-local"
                      label="Arrival"
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      helperText="Auto-calculated"
                    />
                  )}
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <Controller
                  name="basePrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Base Price (VND)"
                      fullWidth
                      required
                      onChange={(e) => field.onChange(+e.target.value)}
                    />
                  )}
                />

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                        <MenuItem value="DELAYED">Delayed</MenuItem>
                        <MenuItem value="COMPLETED">Completed</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={create.isPending || update.isPending}
            >
              {editingId ? 'Update' : 'Schedule'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}