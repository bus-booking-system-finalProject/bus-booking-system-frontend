import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Avatar,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material';
import { Person, Lock, Save } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, changePassword } from '@/lib/api/AuthApi';
import Header from '@/components/layout/Header';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabIndex, setTabIndex] = useState(0);
  const [toast, setToast] = useState({
    open: false,
    msg: '',
    type: 'success' as 'success' | 'error',
  });

  // 1. LAZY INITIALIZATION (No useEffect needed thanks to the wrapper)
  const [formData, setFormData] = useState(() => ({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    avatarUrl: user?.avatarUrl || '',
  }));

  // --- Password State ---
  const [passData, setPassData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSubmit = async () => {
    try {
      await updateProfile(formData);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setToast({ open: true, msg: 'Cập nhật thông tin thành công!', type: 'success' });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || 'Update failed';
      setToast({ open: true, msg, type: 'error' });
    }
  };

  const handlePasswordSubmit = async () => {
    if (passData.newPassword !== passData.confirmPassword) {
      setToast({ open: true, msg: 'Mật khẩu mới không khớp!', type: 'error' });
      return;
    }
    try {
      await changePassword(passData.oldPassword, passData.newPassword);
      setToast({ open: true, msg: 'Đổi mật khẩu thành công!', type: 'success' });
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || 'Change password failed';
      setToast({ open: true, msg, type: 'error' });
    }
  };

  useEffect(() => {
    if (!user) {
      navigate({ to: '/' });
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <Header />
      <Container maxWidth="md" sx={{ mt: 4, pb: 8 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Tài khoản của tôi
        </Typography>

        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}
          >
            <Tab icon={<Person />} label="Thông tin cá nhân" iconPosition="start" />
            <Tab icon={<Lock />} label="Bảo mật" iconPosition="start" />
          </Tabs>

          <Box sx={{ p: 4 }}>
            {tabIndex === 0 ? (
              // --- TAB 1: PROFILE INFO ---
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                {/* Left Side: Avatar */}
                <Box sx={{ textAlign: 'center', minWidth: 200 }}>
                  <Avatar
                    src={formData.avatarUrl}
                    sx={{ width: 120, height: 120, fontSize: 40, mb: 2, mx: 'auto' }}
                  >
                    {user.email[0].toUpperCase()}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {user.email}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Thành viên
                  </Typography>
                </Box>

                {/* Right Side: Form */}
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={3}>
                    <TextField
                      label="Họ và tên"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Số điện thoại"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Avatar URL"
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      fullWidth
                      helperText="Nhập đường dẫn ảnh (URL)"
                    />
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Save />}
                      onClick={handleProfileSubmit}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Lưu thay đổi
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            ) : (
              // --- TAB 2: CHANGE PASSWORD ---
              <Box maxWidth={500} mx="auto">
                <Typography variant="h6" gutterBottom>
                  Đổi mật khẩu
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    label="Mật khẩu hiện tại"
                    type="password"
                    value={passData.oldPassword}
                    onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                  />
                  <TextField
                    label="Mật khẩu mới"
                    type="password"
                    value={passData.newPassword}
                    onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  />
                  <TextField
                    label="Nhập lại mật khẩu mới"
                    type="password"
                    value={passData.confirmPassword}
                    onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  />
                  <Button variant="contained" size="large" onClick={handlePasswordSubmit}>
                    Cập nhật mật khẩu
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={toast.type} onClose={() => setToast({ ...toast, open: false })}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
