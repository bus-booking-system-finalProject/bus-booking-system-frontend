/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Card,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Add, Edit, Delete, CalendarMonth, DirectionsBus } from '@mui/icons-material';
import { useForm, Controller, type SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseISO, addMinutes, format } from 'date-fns';

// Hooks
import { useSearchTrips, useMutateTrip } from '@/hooks/admin/useTrips';
import { useRoutes } from '@/hooks/admin/useRoutes';
import { useBuses } from '@/hooks/admin/useBuses';

// Types
import type { TripResponse, TripPayload, TripStatus } from '@/types/AdminTypes';
import { TripSchema, type TripFormValues } from '@/schemas/TripsSchema';

export default function TripsPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // --- QUERIES ---
  const { data: tripResponse, isLoading: tripsLoading } = useSearchTrips({ page: 1, limit: 100 });

  // FIX: Cast to TripResponse[] because the Hook likely defaults to generic Trip[]
  const trips = (tripResponse?.data || []) as unknown as TripResponse[];

  const { data: routes = [] } = useRoutes();
  const { data: buses = [] } = useBuses();

  // --- MUTATIONS ---
  const { create, update, delete: remove } = useMutateTrip();

  const { control, handleSubmit, reset, setValue } = useForm<TripFormValues>({
    resolver: zodResolver(TripSchema),
    defaultValues: { status: 'SCHEDULED', basePrice: 0 },
  });

  // --- Auto-Calculate Arrival Time ---
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
          console.error('Invalid date calculation', e);
        }
      }
    }
  }, [selectedRouteId, departureTime, routes, setValue]);

  // --- Handlers (Wrapped in useCallback to fix ESLint/Memo errors) ---

  const handleOpen = useCallback(
    (trip?: TripResponse) => {
      setServerError(null);
      if (trip) {
        setEditingId(trip.tripId);

        // Reverse lookup: DTO -> ID (use route.name which contains "Origin - Destination")
        const matchedRoute = routes.find(
          (r) => `${r.origin} - ${r.destination}` === trip.route.name,
        );
        const matchedBus = buses.find((b) => b.model === trip.bus.model);

        reset({
          routeId: matchedRoute?.id || '',
          busId: matchedBus?.id || '',
          departureTime: trip.schedules?.departureTime
            ? format(parseISO(trip.schedules.departureTime), "yyyy-MM-dd'T'HH:mm")
            : '',
          arrivalTime: trip.schedules?.arrivalTime
            ? format(parseISO(trip.schedules.arrivalTime), "yyyy-MM-dd'T'HH:mm")
            : '',
          basePrice: trip.pricing?.original ?? 0,
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
    },
    [routes, buses, reset],
  );

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm('Are you sure you want to delete this trip?')) {
        remove.mutate(id);
      }
    },
    [remove],
  );

  const onSubmit: SubmitHandler<TripFormValues> = (data) => {
    // FIX: Strict typing for the payload
    const payload: TripPayload = {
      routeId: data.routeId,
      busId: data.busId,
      departureTime: new Date(data.departureTime).toISOString(),
      arrivalTime: new Date(data.arrivalTime).toISOString(),
      originalPrice: data.basePrice, // Map form field to backend field name
      status: data.status as TripStatus,
    };

    if (editingId) {
      // Cast payload as 'any' if your useMutateTrip is strictly typed to the Entity,
      // or ensure useMutateTrip accepts TripPayload.
      update.mutate(
        { id: editingId, data: payload as any },
        { onSuccess: handleClose, onError: (e) => setServerError(e.message) },
      );
    } else {
      create.mutate(payload as any, {
        onSuccess: handleClose,
        onError: (e) => setServerError(e.message),
      });
    }
  };

  // --- Columns ---
  const columns = useMemo<GridColDef<TripResponse>[]>(
    () => [
      {
        field: 'route',
        headerName: 'Route',
        width: 250,
        renderCell: (params) => {
          const route = params.row.route;
          if (!route) {
            return (
              <Typography variant="body2" color="text.secondary">
                N/A
              </Typography>
            );
          }
          return (
            <Stack>
              <Typography variant="body2" fontWeight="bold">
                {route.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {route.durationMinutes} mins
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'bus',
        headerName: 'Bus',
        width: 200,
        renderCell: (params) => {
          const bus = params.row.bus;
          if (!bus) {
            return (
              <Typography variant="body2" color="text.secondary">
                N/A
              </Typography>
            );
          }
          return (
            <Stack direction="row" alignItems="center" gap={1}>
              <DirectionsBus fontSize="small" color="action" />
              <Box>
                <Typography variant="body2">{bus.model}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {bus.type}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      {
        field: 'schedules',
        headerName: 'Schedule',
        width: 220,
        renderCell: (params) => {
          const schedules = params.row.schedules;
          if (!schedules?.departureTime || !schedules?.arrivalTime) {
            return (
              <Typography variant="body2" color="text.secondary">
                N/A
              </Typography>
            );
          }
          return (
            <Stack spacing={0.5} py={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" fontWeight={500}>
                  Dep: {format(parseISO(schedules.departureTime), 'dd/MM HH:mm')}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" color="text.secondary">
                  Arr: {format(parseISO(schedules.arrivalTime), 'dd/MM HH:mm')}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      {
        field: 'price',
        headerName: 'Price',
        width: 140,
        // FIX: Handle safe valueGetter - use 'original' (matches backend)
        valueGetter: (_, row) => row.pricing?.original ?? 0,
        valueFormatter: (value: number) =>
          new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        renderCell: (params) => {
          const colors: Record<string, 'default' | 'success' | 'error' | 'info' | 'warning'> = {
            SCHEDULED: 'info',
            COMPLETED: 'success',
            CANCELLED: 'error',
            DELAYED: 'warning',
          };
          return (
            <Chip
              label={params.row.status}
              color={colors[params.row.status] || 'default'}
              size="small"
              variant="outlined"
            />
          );
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        renderCell: (params) => (
          <Stack direction="row">
            <IconButton size="small" onClick={() => handleOpen(params.row)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row.tripId)}>
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [handleOpen, handleDelete],
  ); // FIX: Dependencies now stable via useCallback

  if (tripsLoading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box sx={{ height: '100%', width: '100%', p: 3, bgcolor: '#f8f9fa' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <CalendarMonth color="primary" /> Trip Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage schedules, pricing, and availability
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} size="large">
          Schedule Trip
        </Button>
      </Stack>

      <Card sx={{ height: 600, width: '100%', boxShadow: 2 }}>
        <DataGrid
          rows={trips}
          columns={columns}
          getRowId={(row) => row.tripId}
          rowHeight={70}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingId ? 'Edit Trip Details' : 'Schedule New Trip'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Stack spacing={3}>
              {serverError && <Alert severity="error">{serverError}</Alert>}

              {/* ROUTE SELECTION */}
              <Controller
                name="routeId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={routes}
                    getOptionLabel={(opt) => `${opt.origin} → ${opt.destination}`}
                    value={routes.find((r) => r.id === field.value) || null}
                    onChange={(_, val) => field.onChange(val?.id)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Route"
                        required
                        error={!!field.value && !field.value}
                      />
                    )}
                  />
                )}
              />

              {/* BUS SELECTION */}
              <Controller
                name="busId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={buses}
                    getOptionLabel={(opt) => `${opt.plateNumber} (${opt.model})`}
                    value={buses.find((b) => b.id === field.value) || null}
                    onChange={(_, val) => field.onChange(val?.id)}
                    renderInput={(params) => <TextField {...params} label="Select Bus" required />}
                  />
                )}
              />

              {/* TIME SELECTION */}
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

              {/* PRICE AND STATUS */}
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
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={create.isPending || update.isPending}
            >
              {editingId ? 'Save Changes' : 'Publish Trip'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
