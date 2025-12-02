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
import { Add, Edit, Delete, DirectionsBus } from '@mui/icons-material';
import { useBuses, useMutateBus } from '@/hooks/admin/useBuses';
import { useOperators } from '@/hooks/admin/useOperators';
import type { Bus, BusType } from '@/types/AdminTypes';

export default function BusesPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Default form state
  const [formData, setFormData] = useState<Partial<Bus>>({
    type: 'SLEEPER',
    seatCapacity: 40,
  });

  // Queries
  const { data: buses = [], isLoading: loadingBuses } = useBuses();
  const { data: operators = [] } = useOperators();
  
  // Mutations
  const { create, update, delete: remove } = useMutateBus();

  const handleOpen = (bus?: Bus) => {
    if (bus) {
      setEditingId(bus.id);
      setFormData(bus);
    } else {
      setEditingId(null);
      setFormData({ type: 'SLEEPER', seatCapacity: 40 });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({});
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.operatorId) {
      alert('Please select an operator');
      return;
    }

    if (editingId) {
      update.mutate(
        { id: editingId, data: formData },
        { onSuccess: handleClose }
      );
    } else {
      create.mutate(formData as Bus, { onSuccess: handleClose });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this bus?')) remove.mutate(id);
  };

  const columns: GridColDef[] = [
    { field: 'plateNumber', headerName: 'Plate Number', width: 150 },
    { 
      field: 'operatorId', 
      headerName: 'Operator', 
      width: 200,
      valueGetter: (_, row) => operators.find(op => op.id === row.operatorId)?.name || 'Unknown'
    },
    { field: 'model', headerName: 'Model', width: 150 },
    { field: 'type', headerName: 'Type', width: 130 },
    { field: 'seatCapacity', headerName: 'Seats', type: 'number', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
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

  if (loadingBuses) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DirectionsBus /> Fleet Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Bus
        </Button>
      </Stack>

      <DataGrid
        rows={buses}
        columns={columns}
        autoHeight
        sx={{ bgcolor: 'white' }}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingId ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={formData.operatorId || ''}
                  label="Operator"
                  onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
                  required
                >
                  {operators.map((op) => (
                    <MenuItem key={op.id} value={op.id}>
                      {op.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Plate Number"
                fullWidth
                required
                value={formData.plateNumber || ''}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
              />
              
              <TextField
                label="Model"
                fullWidth
                required
                value={formData.model || ''}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />

              <Stack direction="row" spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type || 'SLEEPER'}
                    label="Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as BusType })}
                  >
                    <MenuItem value="SLEEPER">Sleeper</MenuItem>
                    <MenuItem value="LIMOUSINE">Limousine</MenuItem>
                    <MenuItem value="SEATER">Seater</MenuItem>
                    <MenuItem value="VIP">VIP</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Capacity"
                  type="number"
                  fullWidth
                  required
                  value={formData.seatCapacity}
                  onChange={(e) => setFormData({ ...formData, seatCapacity: +e.target.value })}
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