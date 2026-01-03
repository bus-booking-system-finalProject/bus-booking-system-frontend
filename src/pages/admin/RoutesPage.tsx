import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Stack,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Tooltip,
  Paper,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
  Plus,
  Edit,
  Trash2,
  Map,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  MapPin,
  Flag,
} from 'lucide-react';
import { useRoutes } from '@/hooks/admin/useRoutes';
import { useStations } from '@/hooks/admin/useStations';
import type {
  RouteRequest,
  RouteStopRequest,
  RouteResponse,
  RouteStopResponse,
} from '@/types/admin/RouteTypes';

export default function RoutesPage() {
  const { routesQuery, createRoute, updateRoute, deleteRoute } = useRoutes();
  const { stationsQuery } = useStations();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<RouteRequest>({
    name: '',
    origin: '',
    destination: '',
    distanceKm: 0,
    estimatedMinutes: 0,
    isActive: true,
    pickupStops: [],
    dropoffStops: [],
  });

  // Temporary Stop State for adding to list
  const [newStop, setNewStop] = useState<{
    type: 'PICKUP' | 'DROPOFF';
    stationId: string;
    duration: number;
  }>({
    type: 'PICKUP',
    stationId: '',
    duration: 0,
  });

  const handleOpen = (route?: RouteResponse) => {
    if (route) {
      setEditingId(route.id);
      setFormData({
        name: route.details.name,
        origin: route.details.origin,
        destination: route.details.destination,
        distanceKm: route.details.distanceKm,
        estimatedMinutes: route.details.estimatedMinutes,
        isActive: route.isActive,
        // UPDATED: Use p.id as stationId and check route.from/to for flags
        pickupStops: route.pickup_points.map((p: RouteStopResponse) => ({
          stationId: p.id,
          duration: p.duration,
          isOrigin: route.from?.id === p.id, // Check against 'from' object
          isDestination: false,
        })),
        dropoffStops: route.dropoff_points.map((p: RouteStopResponse) => ({
          stationId: p.id,
          duration: p.duration,
          isOrigin: false,
          isDestination: route.to?.id === p.id, // Check against 'to' object
        })),
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        origin: '',
        destination: '',
        distanceKm: 0,
        estimatedMinutes: 0,
        isActive: true,
        pickupStops: [],
        dropoffStops: [],
      });
    }
    setOpen(true);
  };

  const addStop = () => {
    if (!newStop.stationId) return;

    const stopReq: RouteStopRequest = {
      stationId: newStop.stationId,
      duration: Number(newStop.duration),
      isOrigin: false,
      isDestination: false,
    };

    if (newStop.type === 'PICKUP') {
      setFormData((prev) => ({ ...prev, pickupStops: [...prev.pickupStops, stopReq] }));
    } else {
      setFormData((prev) => ({ ...prev, dropoffStops: [...prev.dropoffStops, stopReq] }));
    }

    setNewStop((prev) => ({ ...prev, stationId: '', duration: 0 }));
  };

  const removeStop = (type: 'PICKUP' | 'DROPOFF', index: number) => {
    const listKey = type === 'PICKUP' ? 'pickupStops' : 'dropoffStops';
    setFormData((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index),
    }));
  };

  // Reorder Logic
  const moveStop = (type: 'PICKUP' | 'DROPOFF', index: number, direction: 'up' | 'down') => {
    const listKey = type === 'PICKUP' ? 'pickupStops' : 'dropoffStops';
    const newList = [...formData[listKey]];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Boundary check
    if (targetIndex < 0 || targetIndex >= newList.length) return;

    // Swap
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];

    setFormData((prev) => ({ ...prev, [listKey]: newList }));
  };

  // Flag Logic (Origin/Destination)
  const setStopFlag = (
    type: 'PICKUP' | 'DROPOFF',
    index: number,
    flag: 'isOrigin' | 'isDestination',
  ) => {
    const listKey = type === 'PICKUP' ? 'pickupStops' : 'dropoffStops';

    // Map through list: Set the clicked index to TRUE, all others to FALSE
    const newList = formData[listKey].map((stop, i) => ({
      ...stop,
      [flag]: i === index ? !stop[flag] : false, // Toggle target, disable others
    }));

    setFormData((prev) => ({ ...prev, [listKey]: newList }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateRoute.mutate({ id: editingId, data: formData });
    } else {
      createRoute.mutate(formData);
    }
    setOpen(false);
  };

  // UPDATED: Render List with Order Controls on the Left
  const renderStopList = (stops: RouteStopRequest[], type: 'PICKUP' | 'DROPOFF') => (
    <List
      dense
      sx={{ bgcolor: '#f8fafc', borderRadius: 2, mt: 1, maxHeight: 300, overflow: 'auto' }}
    >
      {stops.map((stop, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            mb: 1,
            mx: 1,
            border: '1px solid #e2e8f0',
            bgcolor: stop.isOrigin ? '#f0fdf4' : stop.isDestination ? '#fef2f2' : 'white',
          }}
        >
          <ListItem
            secondaryAction={
              // Delete button remains on the right
              <IconButton
                edge="end"
                size="small"
                onClick={() => removeStop(type, index)}
                color="error"
                type="button"
              >
                <Trash2 size={16} />
              </IconButton>
            }
          >
            {/* Left Hand: Order Management */}
            <Stack direction="column" sx={{ mr: 2, alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={() => moveStop(type, index, 'up')}
                disabled={index === 0}
                type="button"
                sx={{ p: 0.5 }}
              >
                <ArrowUp size={12} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => moveStop(type, index, 'down')}
                disabled={index === stops.length - 1}
                type="button"
                sx={{ p: 0.5 }}
              >
                <ArrowDown size={12} />
              </IconButton>
            </Stack>

            <ListItemText
              primary={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" fontWeight={500}>
                    {stationsQuery.data?.find((s) => s.id === stop.stationId)?.name ||
                      'Unknown Station'}
                  </Typography>
                  {/* Origin Flag Chip */}
                  <Tooltip title="Click to mark as Origin">
                    <Chip
                      label="Start"
                      size="small"
                      icon={<MapPin size={12} />}
                      color={stop.isOrigin ? 'success' : 'default'}
                      variant={stop.isOrigin ? 'filled' : 'outlined'}
                      onClick={() => setStopFlag(type, index, 'isOrigin')}
                      sx={{ height: 20, fontSize: '0.7rem', cursor: 'pointer' }}
                    />
                  </Tooltip>
                  {/* Destination Flag Chip */}
                  <Tooltip title="Click to mark as Destination">
                    <Chip
                      label="End"
                      size="small"
                      icon={<Flag size={12} />}
                      color={stop.isDestination ? 'error' : 'default'}
                      variant={stop.isDestination ? 'filled' : 'outlined'}
                      onClick={() => setStopFlag(type, index, 'isDestination')}
                      sx={{ height: 20, fontSize: '0.7rem', cursor: 'pointer' }}
                    />
                  </Tooltip>
                </Stack>
              }
              secondary={`+${stop.duration} mins offset`}
            />
          </ListItem>
        </Paper>
      ))}
      {stops.length === 0 && (
        <Typography variant="caption" sx={{ p: 2, display: 'block', color: 'text.disabled' }}>
          No points added
        </Typography>
      )}
    </List>
  );

  const columns: GridColDef<RouteResponse>[] = [
    {
      field: 'name',
      headerName: 'Route Name',
      flex: 1.5,
      valueGetter: (_, row) => row.details?.name,
    },
    {
      field: 'path',
      headerName: 'Path',
      flex: 2,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ height: '100%' }}>
          <Typography variant="body2">{params.row.details?.origin}</Typography>
          <ArrowRight size={14} color="#666" />
          <Typography variant="body2">{params.row.details?.destination}</Typography>
        </Stack>
      ),
    },
    {
      field: 'distance',
      headerName: 'Distance',
      width: 100,
      valueGetter: (_, row) => `${row.details?.distanceKm} km`,
    },
    {
      field: 'time',
      headerName: 'Est. Time',
      width: 120,
      valueGetter: (_, row) =>
        `${Math.floor(row.details?.estimatedMinutes / 60)}h ${row.details?.estimatedMinutes % 60}m`,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'Active' : 'Inactive'}
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignContent="center" sx={{ height: '100%' }}>
          <IconButton
            size="small"
            onClick={() => handleOpen(params.row)}
            color="primary"
            sx={{ height: '100%' }}
          >
            <Edit size={18} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => deleteRoute.mutate(params.row.id)}
            color="error"
            type="button"
          >
            <Trash2 size={18} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Route Network
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure paths, distances, and stop points
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2 }}
        >
          Create Route
        </Button>
      </Stack>

      <Card sx={{ height: 600, width: '100%', boxShadow: 1, borderRadius: 3 }}>
        <DataGrid
          rows={routesQuery.data || []}
          columns={columns}
          loading={routesQuery.isLoading}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Map size={20} /> {editingId ? 'Edit Route' : 'Create Route'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid sx={{ borderRight: '1px solid #eee', xs: 12, md: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Basic Info
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Route Name"
                    fullWidth
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <TextField
                    label="Origin City"
                    fullWidth
                    required
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  />
                  <TextField
                    label="Destination City"
                    fullWidth
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  />
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Distance (km)"
                      type="number"
                      fullWidth
                      required
                      value={formData.distanceKm}
                      onChange={(e) =>
                        setFormData({ ...formData, distanceKm: Number(e.target.value) })
                      }
                    />
                    <TextField
                      label="Est. Minutes"
                      type="number"
                      fullWidth
                      required
                      value={formData.estimatedMinutes}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedMinutes: Number(e.target.value) })
                      }
                    />
                  </Stack>
                </Stack>
              </Grid>

              {/* Stops Configuration */}
              <Grid sx={{ xs: 12, md: 8 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Stop Configuration
                </Typography>

                {/* Add Stop Widget */}
                <Card variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f8fafc' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      select
                      label="Stop Type"
                      size="small"
                      sx={{ width: 200 }}
                      value={newStop.type}
                      onChange={(e) =>
                        setNewStop({ ...newStop, type: e.target.value as 'PICKUP' | 'DROPOFF' })
                      }
                    >
                      <MenuItem value="PICKUP">Pick-up</MenuItem>
                      <MenuItem value="DROPOFF">Drop-off</MenuItem>
                    </TextField>
                    <TextField
                      select
                      label="Station"
                      size="small"
                      fullWidth
                      value={newStop.stationId}
                      onChange={(e) => setNewStop({ ...newStop, stationId: e.target.value })}
                    >
                      {stationsQuery.data?.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name} ({s.city})
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Offset (min)"
                      type="number"
                      size="small"
                      sx={{ width: 120 }}
                      value={newStop.duration}
                      onChange={(e) => setNewStop({ ...newStop, duration: Number(e.target.value) })}
                    />
                    <Button
                      variant="contained"
                      onClick={addStop}
                      sx={{ minWidth: 100 }}
                      type="button"
                    >
                      Add
                    </Button>
                  </Stack>
                </Card>

                <Grid container spacing={2}>
                  {/* Pick-up List */}
                  <Grid sx={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      PICKUP POINTS ({formData.pickupStops.length})
                    </Typography>
                    {renderStopList(formData.pickupStops, 'PICKUP')}
                  </Grid>

                  {/* Drop-off List */}
                  <Grid sx={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      DROPOFF POINTS ({formData.dropoffStops.length})
                    </Typography>
                    {renderStopList(formData.dropoffStops, 'DROPOFF')}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button onClick={() => setOpen(false)} color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained" size="large">
                Save Route
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
