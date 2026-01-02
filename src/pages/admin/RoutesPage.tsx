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
  ListItemSecondaryAction,
  MenuItem,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Plus, Edit, Trash2, Map, ArrowRight, Clock } from 'lucide-react';
import { useRoutes } from '@/hooks/admin/useRoutes';
import { useStations } from '@/hooks/admin/useStations'; // Reuse previous hook
import type { RouteRequest, RouteStopRequest } from '@/types/admin/RouteTypes';

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

  const handleOpen = (route?: any) => {
    if (route) {
      setEditingId(route.id);
      // Map response to request structure if needed, simplified here:
      setFormData({
        name: route.details.name,
        origin: route.details.origin,
        destination: route.details.destination,
        distanceKm: route.details.distanceKm,
        estimatedMinutes: route.details.estimatedMinutes,
        isActive: route.isActive,
        pickupStops: route.pickup_points.map((p: any) => ({ ...p, stationId: p.id })),
        dropoffStops: route.dropoff_points.map((p: any) => ({ ...p, stationId: p.id })),
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
      isOrigin: false, // You might want logic to set first pickup as origin
      isDestination: false,
    };

    if (newStop.type === 'PICKUP') {
      setFormData((prev) => ({ ...prev, pickupStops: [...prev.pickupStops, stopReq] }));
    } else {
      setFormData((prev) => ({ ...prev, dropoffStops: [...prev.dropoffStops, stopReq] }));
    }

    // Reset selection but keep type for ease of use
    setNewStop((prev) => ({ ...prev, stationId: '', duration: 0 }));
  };

  const removeStop = (type: 'PICKUP' | 'DROPOFF', index: number) => {
    if (type === 'PICKUP') {
      setFormData((prev) => ({
        ...prev,
        pickupStops: prev.pickupStops.filter((_, i) => i !== index),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        dropoffStops: prev.dropoffStops.filter((_, i) => i !== index),
      }));
    }
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

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Route Name',
      flex: 1.5,
      valueGetter: (params) => params.row.details?.name,
    },
    {
      field: 'path',
      headerName: 'Path',
      flex: 2,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
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
      valueGetter: (params) => `${params.row.details?.distanceKm} km`,
    },
    {
      field: 'time',
      headerName: 'Est. Time',
      width: 120,
      valueGetter: (params) =>
        `${Math.floor(params.row.details?.estimatedMinutes / 60)}h ${params.row.details?.estimatedMinutes % 60}m`,
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
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => handleOpen(params.row)} color="primary">
            <Edit size={18} />
          </IconButton>
          <IconButton size="small" onClick={() => deleteRoute.mutate(params.row.id)} color="error">
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
              <Grid item xs={12} md={4} sx={{ borderRight: '1px solid #eee' }}>
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
              <Grid item xs={12} md={8}>
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
                      sx={{ width: 150 }}
                      value={newStop.type}
                      onChange={(e) => setNewStop({ ...newStop, type: e.target.value as any })}
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
                    <Button variant="contained" onClick={addStop} sx={{ minWidth: 100 }}>
                      Add
                    </Button>
                  </Stack>
                </Card>

                <Grid container spacing={2}>
                  {/* Pick-up List */}
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      PICKUP POINTS ({formData.pickupStops.length})
                    </Typography>
                    <List
                      dense
                      sx={{
                        bgcolor: '#f1f5f9',
                        borderRadius: 2,
                        mt: 1,
                        maxHeight: 300,
                        overflow: 'auto',
                      }}
                    >
                      {formData.pickupStops.map((stop, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={
                              stationsQuery.data?.find((s) => s.id === stop.stationId)?.name ||
                              'Unknown Station'
                            }
                            secondary={`+${stop.duration} mins from start`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => removeStop('PICKUP', index)}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                      {formData.pickupStops.length === 0 && (
                        <Typography
                          variant="caption"
                          sx={{ p: 2, display: 'block', color: 'text.disabled' }}
                        >
                          No pickup points added
                        </Typography>
                      )}
                    </List>
                  </Grid>

                  {/* Drop-off List */}
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      DROPOFF POINTS ({formData.dropoffStops.length})
                    </Typography>
                    <List
                      dense
                      sx={{
                        bgcolor: '#f1f5f9',
                        borderRadius: 2,
                        mt: 1,
                        maxHeight: 300,
                        overflow: 'auto',
                      }}
                    >
                      {formData.dropoffStops.map((stop, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={
                              stationsQuery.data?.find((s) => s.id === stop.stationId)?.name ||
                              'Unknown Station'
                            }
                            secondary={`+${stop.duration} mins from start`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => removeStop('DROPOFF', index)}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                      {formData.dropoffStops.length === 0 && (
                        <Typography
                          variant="caption"
                          sx={{ p: 2, display: 'block', color: 'text.disabled' }}
                        >
                          No dropoff points added
                        </Typography>
                      )}
                    </List>
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
