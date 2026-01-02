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
  Tooltip,
  Stack,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Plus, Edit, Trash2, Bus as BusIcon } from 'lucide-react';
import { useBuses } from '@/hooks/admin/useBuses';
import { useBusModels } from '@/hooks/admin/useBusModels'; // Import Models Hook
import type { BusRequest, BusResponse } from '@/types/admin/BusTypes';

export default function BusesPage() {
  const { busesQuery, createBus, updateBus, deleteBus } = useBuses();
  const { busModelsQuery } = useBusModels(); // Fetch models for the dropdown

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<BusRequest>({
    plateNumber: '',
    busModelId: '',
    isActive: true,
  });

  const handleOpen = (bus?: BusResponse) => {
    if (bus) {
      setEditingId(bus.id);
      setFormData({
        plateNumber: bus.plateNumber,
        busModelId: bus?.id || '',
        isActive: bus.isActive ?? true,
      });
    } else {
      setEditingId(null);
      setFormData({ plateNumber: '', busModelId: '', isActive: true });
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateBus.mutate({ id: editingId, data: formData });
    } else {
      createBus.mutate(formData);
    }
    setOpen(false);
  };

  const columns: GridColDef<BusResponse>[] = [
    { field: 'plateNumber', headerName: 'Plate Number', minWidth: 150 },
    {
      field: 'modelName',
      headerName: 'Bus Model',
      flex: 1.5,
      maxWidth: 300,
      minWidth: 200,
      valueGetter: (_, row) => row?.model?.name || 'Unknown',
    },
    {
      field: 'typeDisplay',
      headerName: 'Type Display',
      flex: 1.5,
      maxWidth: 300,
      minWidth: 200,
      valueGetter: (_, row) => row?.model?.typeDisplay || 'Unknown',
    },
    {
      field: 'seatCapacity',
      headerName: 'Seats',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (_, row) => row?.model?.seatCapacity || 0,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      flex: 1,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          alignItems="center"
          sx={{ height: '100%' }}
        >
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleOpen(params.row)} color="primary">
              <Edit size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => deleteBus.mutate(params.row.id)} color="error">
              <Trash2 size={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Fleet Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage physical buses and assignments
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => handleOpen()}>
          Add New
        </Button>
      </Stack>

      <Card sx={{ height: 600, width: '100%', boxShadow: 1, borderRadius: 3 }}>
        <DataGrid
          rows={busesQuery.data || []}
          columns={columns}
          loading={busesQuery.isLoading}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusIcon size={20} /> {editingId ? 'Edit Bus' : 'New Bus'}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="License Plate Number"
              fullWidth
              required
              value={formData.plateNumber}
              onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
            />

            {/* The Critical Link: Select a Bus Model */}
            <TextField
              select
              label="Bus Model"
              fullWidth
              required
              value={formData.busModelId}
              onChange={(e) => setFormData({ ...formData, busModelId: e.target.value })}
              helperText="Select the configuration (Seats, Type) for this bus"
            >
              {busModelsQuery.data?.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name} ({model.typeDisplay} - {model.seatCapacity} seats)
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />

            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
              <Button onClick={() => setOpen(false)} color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Save
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
