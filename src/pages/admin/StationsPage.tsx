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
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { useStations } from '@/hooks/admin/useStations';
import type { StationRequest } from '@/types/admin/StationTypes';

export default function StationsPage() {
  const { stationsQuery, createStation, updateStation, deleteStation } = useStations();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StationRequest>({
    name: '',
    address: '',
    ward: '',
    city: '',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpen = (station?: any) => {
    if (station) {
      setEditingId(station.id);
      setFormData({
        name: station.name,
        address: station.address,
        ward: station.ward,
        city: station.city,
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', address: '', ward: '', city: '' });
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateStation.mutate({ id: editingId, data: formData });
    } else {
      createStation.mutate(formData);
    }
    setOpen(false);
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Station Name', flex: 1, minWidth: 200 },
    { field: 'city', headerName: 'City/Province', width: 150 },
    { field: 'ward', headerName: 'Ward', width: 150 },
    { field: 'address', headerName: 'Full Address', flex: 1, minWidth: 250 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      headerAlign: 'right',
      align: 'right',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="flex-end"
          sx={{ height: '100%' }}
        >
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleOpen(params.row)} color="primary">
              <Edit size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => deleteStation.mutate(params.row.id)}
              color="error"
            >
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
            Station Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage pickup and dropoff points
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Add New
        </Button>
      </Stack>

      <Card sx={{ height: 600, width: '100%', boxShadow: 1, borderRadius: 3 }}>
        <DataGrid
          rows={stationsQuery.data || []}
          columns={columns}
          loading={stationsQuery.isLoading}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MapPin size={20} /> {editingId ? 'Edit Station' : 'New Station'}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="Station Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="City"
                fullWidth
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <TextField
                label="Ward"
                fullWidth
                required
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              />
            </Stack>
            <TextField
              label="Street Address"
              fullWidth
              required
              multiline
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
              <Button onClick={() => setOpen(false)} color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Save Changes
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
