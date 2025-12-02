import React, { useState } from 'react';
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
  TextField,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Add, Edit, Delete, Map } from '@mui/icons-material';
import { useRoutes, useMutateRoute } from '@/hooks/admin/useRoutes';
import { useOperators } from '@/hooks/admin/useOperators';
import type { Route } from '@/types/AdminTypes';

// Define Write DTO specifically for the form
type RouteFormData = {
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedMinutes: number;
  operatorId: string;
};

const INITIAL_FORM_STATE: RouteFormData = {
  origin: '',
  destination: '',
  distanceKm: 0,
  estimatedMinutes: 0,
  operatorId: '',
};

export default function RoutesPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Use the Write DTO type for form state
  const [formData, setFormData] = useState<RouteFormData>(INITIAL_FORM_STATE);

  const { data: routes = [], isLoading } = useRoutes();
  const { data: operators = [] } = useOperators();
  const { create, update, delete: remove } = useMutateRoute();

  const handleOpen = (route?: Route) => {
    if (route) {
      setEditingId(route.id);
      // Map Read DTO (nested object) to Write DTO (flat ID)
      setFormData({
        origin: route.origin,
        destination: route.destination,
        distanceKm: route.distanceKm,
        estimatedMinutes: route.estimatedMinutes,
        operatorId: route.operator?.id || '',
      });
    } else {
      setEditingId(null);
      setFormData(INITIAL_FORM_STATE);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(INITIAL_FORM_STATE);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.operatorId) {
      alert('Please select an operator');
      return;
    }

    // Ensure numeric values are numbers
    const payload = {
        ...formData,
        distanceKm: Number(formData.distanceKm),
        estimatedMinutes: Number(formData.estimatedMinutes)
    };

    if (editingId) {
      update.mutate({ id: editingId, data: payload }, { onSuccess: handleClose });
    } else {
      // @ts-expect-error: See above
      create.mutate(payload, { onSuccess: handleClose });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this route?')) remove.mutate(id);
  };

  const columns: GridColDef<Route>[] = [
    { 
      field: 'operator', 
      headerName: 'Operator', 
      width: 150,
      // Safely access the nested operator object for display
      valueGetter: (_, row) => row.operator?.name || 'N/A',
    },
    { field: 'origin', headerName: 'Origin', width: 150 },
    { field: 'destination', headerName: 'Destination', width: 150 },
    { field: 'distanceKm', headerName: 'Distance (km)', type: 'number', width: 120 },
    { field: 'estimatedMinutes', headerName: 'Duration (min)', type: 'number', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
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

  if (isLoading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Map /> Route Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Route
        </Button>
      </Stack>

      <DataGrid
        rows={routes}
        columns={columns}
        autoHeight
        sx={{ bgcolor: 'white' }}
        getRowId={(row) => row.id}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingId ? 'Edit Route' : 'Create New Route'}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              
              {/* Operator Selection */}
              <FormControl fullWidth>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={formData.operatorId}
                  label="Operator"
                  onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
                  required
                >
                  {operators.map((op) => (
                    <MenuItem key={op.id} value={op.id}>{op.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Origin"
                  fullWidth
                  required
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                />
                <TextField
                  label="Destination"
                  fullWidth
                  required
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Distance (km)"
                  type="number"
                  fullWidth
                  required
                  value={formData.distanceKm}
                  onChange={(e) => setFormData({ ...formData, distanceKm: +e.target.value })}
                />
                <TextField
                  label="Duration (minutes)"
                  type="number"
                  fullWidth
                  required
                  value={formData.estimatedMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedMinutes: +e.target.value })}
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
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}