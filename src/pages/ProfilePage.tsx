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
  Badge,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { Person, Lock, Save, CameraAlt } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, changePassword, uploadAvatar } from '@/lib/api/AuthApi';
import Header from '@/components/layout/Header';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import type { UserProfile } from '@/types/auth'; // Import UserProfile type
// Import UserProfile type

// Correct shape of your backend error response
interface BackendErrorResponse {
  success: boolean;
  message: string;
  data?: Record<string, string> | null; // "data" can be a map of errors or null
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabIndex, setTabIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    msg: '',
    type: 'success' as 'success' | 'error',
  });

  const [formData, setFormData] = useState(() => ({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    avatarUrl: user?.avatarUrl || '',
  }));

  const [passData, setPassData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // --- 1. Handle File Upload (Fixes Header Sync) ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToast({ open: true, msg: 'File ảnh quá lớn (Max 5MB)', type: 'error' });
      return;
    }

    try {
      setIsUploading(true);
      const newAvatarUrl = await uploadAvatar(file);

      // A. Update Form State
      setFormData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));

      // B. INSTANTLY UPDATE GLOBAL CACHE (Fixes Header)
      // Since useQuery is disabled in AuthProvider, invalidateQueries won't work alone.
      // We manually update the cache data.
      queryClient.setQueryData<UserProfile | null>(['currentUser'], (oldUser) => {
        if (!oldUser) return null;
        return { ...oldUser, avatarUrl: newAvatarUrl };
      });

      setToast({ open: true, msg: 'Tải ảnh thành công!', type: 'success' });
    } catch (err: unknown) {
      let message = 'Lỗi khi tải ảnh';
      if (err instanceof Error) message = err.message;
      setToast({ open: true, msg: message, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // --- 2. Handle Profile Update (Fixes Error Message) ---
  const handleProfileSubmit = async () => {
    try {
      const updatedUser = await updateProfile(formData);

      // Update global cache with new profile info (Name/Phone)
      queryClient.setQueryData(['currentUser'], updatedUser);

      setToast({ open: true, msg: 'Cập nhật thông tin thành công!', type: 'success' });
    } catch (err: unknown) {
      const error = err as AxiosError<BackendErrorResponse>;
      const responseData = error.response?.data;

      let displayMsg = 'Cập nhật thất bại';

      // 1. Check for specific field validation errors in "data"
      if (responseData?.data && typeof responseData.data === 'object') {
        const fieldErrors = Object.values(responseData.data);
        if (fieldErrors.length > 0) {
          // Join errors: "Full name invalid. Phone number invalid"
          displayMsg = fieldErrors.join('. ');
        }
      }
      // 2. Fallback to main message
      else if (responseData?.message) {
        displayMsg = responseData.message;
      }

      setToast({ open: true, msg: displayMsg, type: 'error' });
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
      const error = err as AxiosError<BackendErrorResponse>;
      const responseData = error.response?.data;

      let displayMsg = 'Đổi mật khẩu thất bại';

      // 1. Check for specific validation errors in "data" (e.g. "New password must be different...")
      if (responseData?.data && typeof responseData.data === 'object') {
        const fieldErrors = Object.values(responseData.data);
        if (fieldErrors.length > 0) {
          displayMsg = fieldErrors.join('. ');
        }
      }
      // 2. Fallback to the main message (e.g. "Old password does not match")
      else if (responseData?.message) {
        displayMsg = responseData.message;
      }

      setToast({ open: true, msg: displayMsg, type: 'error' });
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
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload-button"
                    type="file"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  <label htmlFor="avatar-upload-button">
                    <Tooltip title="Nhấn để thay đổi ảnh đại diện">
                      <IconButton component="span" disabled={isUploading}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <Box
                              sx={{
                                bgcolor: 'white',
                                borderRadius: '50%',
                                p: 0.5,
                                border: '1px solid #ddd',
                                display: 'flex',
                              }}
                            >
                              <CameraAlt color="primary" fontSize="small" />
                            </Box>
                          }
                        >
                          <Avatar
                            src={formData.avatarUrl}
                            sx={{
                              width: 120,
                              height: 120,
                              fontSize: 40,
                              mb: 2,
                              mx: 'auto',
                              border: '1px solid #eee',
                              opacity: isUploading ? 0.5 : 1,
                            }}
                          >
                            {user.email[0].toUpperCase()}
                          </Avatar>
                          {isUploading && (
                            <CircularProgress
                              size={40}
                              sx={{ position: 'absolute', top: 40, left: 40 }}
                            />
                          )}
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  </label>

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

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Save />}
                      onClick={handleProfileSubmit}
                      sx={{ alignSelf: 'flex-start' }}
                      disabled={isUploading}
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
        autoHideDuration={6000}
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
