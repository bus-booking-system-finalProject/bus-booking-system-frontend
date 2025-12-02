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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Add, Delete, EventSeat } from '@mui/icons-material';
import { useOperators } from '@/hooks/admin/useOperators';
import { useSeatTypesByOperator, useMutateSeatType } from '@/hooks/admin/useSeatTypes';
import type { SeatType } from '@/types/AdminTypes';

export default function SeatTypesPage() {
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [open, setOpen] = useState(false);
  
  // Create New Seat Type State
  const [formData, setFormData] = useState<Partial<SeatType>>({
    price: 0
  });

  // Queries
  const { data: operators = [], isLoading: loadingOps } = useOperators();
  const { data: seatTypes = [], isLoading: loadingSeats } = useSeatTypesByOperator(selectedOperatorId);
  
  // Mutation
  const { create, delete: remove } = useMutateSeatType();

  const handleOpen = () => {
    if (!selectedOperatorId) {
      alert('Please select an operator first');
      return;
    }
    setFormData({ price: 0 });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(formData as SeatType, { onSuccess: handleClose });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this seat type?')) {
      remove.mutate(id);
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { 
      field: 'price', 
      headerName: 'Price Markup', 
      type: 'number', 
      width: 150,
      valueFormatter: (params) => {
         return params ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params as number) : '0';
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
          <Delete fontSize="small" />
        </IconButton>
      ),
    },
  ];

  if (loadingOps) return <CircularProgress />;

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventSeat /> Seat Class Configuration
        </Typography>
      </Stack>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Select Operator to Manage
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Operator</InputLabel>
          <Select
            value={selectedOperatorId}
            label="Operator"
            onChange={(e) => setSelectedOperatorId(e.target.value)}
          >
            {operators.map((op) => (
              <MenuItem key={op.id} value={op.id}>
                {op.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedOperatorId ? (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
              Add Seat Type
            </Button>
          </Box>
          <DataGrid
             loading={loadingSeats}
             rows={seatTypes}
             columns={columns}
             autoHeight
             sx={{ bgcolor: 'white' }}
          />
        </>
      ) : (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Please select an operator to view their configured seat types.
        </Typography>
      )}

      {/* CREATE DIALOG */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add Seat Type</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField
                label="Name"
                placeholder="e.g. VIP Lower Deck"
                fullWidth
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <TextField
                label="Price Markup (VND)"
                type="number"
                fullWidth
                required
                helperText="Extra cost added to base trip price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: +e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={create.isPending}
            >
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}