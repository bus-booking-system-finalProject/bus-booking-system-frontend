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
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Add, Edit, Delete, Business } from '@mui/icons-material';
import { useOperators, useMutateOperator } from '@/hooks/admin/useOperators';
import type { Operator } from '@/types/AdminTypes';

export default function OperatorsPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Operator>>({});

  const { data: operators = [], isLoading } = useOperators();
  const { create, update, delete: remove } = useMutateOperator();

  const handleOpen = (op?: Operator) => {
    if (op) {
      setEditingId(op.id);
      setFormData(op);
    } else {
      setEditingId(null);
      setFormData({});
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
    const payload = formData as Operator; // Basic casting for simplicity

    if (editingId) {
      update.mutate({ id: editingId, data: payload }, { onSuccess: handleClose });
    } else {
      create.mutate(payload, { onSuccess: handleClose });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this operator?')) {
      remove.mutate(id);
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Operator Name', flex: 1, minWidth: 200 },
    { field: 'contactEmail', headerName: 'Email', width: 250 },
    { field: 'contactPhone', headerName: 'Phone', width: 180 },
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

  if (isLoading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Business /> Operator Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Operator
        </Button>
      </Stack>

      <DataGrid
        rows={operators}
        columns={columns}
        autoHeight
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        pageSizeOptions={[10, 25]}
        sx={{
          bgcolor: 'white',
          '& .MuiDataGrid-cell': { fontSize: '0.9rem' },
        }}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingId ? 'Edit Operator' : 'Add New Operator'}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField
                label="Name"
                fullWidth
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                label="Contact Email"
                type="email"
                fullWidth
                required
                value={formData.contactEmail || ''}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
              <TextField
                label="Contact Phone"
                fullWidth
                required
                value={formData.contactPhone || ''}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
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
