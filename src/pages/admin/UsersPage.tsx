import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Stack,
  Avatar,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, Edit, Block, CheckCircle } from '@mui/icons-material';
import { AxiosError } from 'axios';

import { useUsers, useMutateUser } from '@/hooks/admin/useUsers';
import { type User, type CreateUserRequest, type UpdateUserRequest } from '@/types/UserTypes';
import { UserRole } from '@/types/enum/UserRole';

// Define the shape of your backend error response
interface ApiErrorResponse {
  success: boolean;
  message: string;
}

const UsersPage: React.FC = () => {
  // 1. Data Hooks
  const { data: users = [], isLoading } = useUsers();
  const { create, update, toggleStatus } = useMutateUser();

  // 2. UI State
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // 3. Toast State (Replaces react-hot-toast)
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [formData, setFormData] = useState<Partial<CreateUserRequest & UpdateUserRequest>>({
    email: '',
    fullName: '',
    password: '',
    role: UserRole.USER,
  });

  // --- Helpers for Toast ---
  const showToast = (message: string, severity: 'success' | 'error') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  // --- Handlers ---
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ email: '', fullName: '', password: '', role: UserRole.USER });
    setOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName || '',
      role: user.role,
      password: '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // Edit Mode
        await update.mutateAsync({
          id: editingUser.id,
          data: {
            fullName: formData.fullName,
            email: formData.email,
            role: formData.role,
          },
        });
        showToast('Update information successfully!', 'success');
      } else {
        // Create Mode
        if (!formData.email || !formData.password || !formData.fullName) {
          showToast('Please enter all required information.', 'error');
          return;
        }
        await create.mutateAsync(formData as CreateUserRequest);
        showToast('Create a new user successfully!', 'success');
      }
      setOpen(false);
    } catch (err: unknown) {
      // Strictly typed error handling
      const error = err as AxiosError<ApiErrorResponse>;
      const msg = error.response?.data?.message || 'An error has occurred when saving data.';
      showToast(msg, 'error');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleStatus.mutateAsync({ id: user.id, enabled: !user.enabled });
      const msg = user.enabled ? 'Đã vô hiệu hóa tài khoản' : 'Account activated';
      showToast(msg, 'success');
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      const msg = error.response?.data?.message || 'Error updating status';
      showToast(msg, 'error');
    }
  };

  if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          User Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>
          Add new
        </Button>
      </Stack>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}
      >
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={user.avatarUrl} alt={user.fullName}>
                      {user.email.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {user.fullName || 'UNKNOWN'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {user.id}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === UserRole.ADMIN ? 'primary' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={user.enabled ? <CheckCircle /> : <Block />}
                    label={user.enabled ? 'Active' : 'Disabled'}
                    color={user.enabled ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpenEdit(user)} color="primary">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color={user.enabled ? 'error' : 'success'}
                    onClick={() => handleToggleStatus(user)}
                  >
                    {user.enabled ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Update user' : 'Create a new user'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Name"
              fullWidth
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            {/* Show password field only on Create */}
            {!editingUser && (
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            )}
            <TextField
              select
              label="Roles"
              fullWidth
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            >
              <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
              <MenuItem value={UserRole.OPERATOR}>Operator</MenuItem>
              <MenuItem value={UserRole.STAFF}>Staff</MenuItem>
              <MenuItem value={UserRole.USER}>User</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={create.isPending || update.isPending}
          >
            {create.isPending || update.isPending
              ? 'Processing...'
              : editingUser
                ? 'Save'
                : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CUSTOM SNACKBAR TOAST */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;
