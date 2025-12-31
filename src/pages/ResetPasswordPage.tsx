import React, { useState } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { resetPassword } from '@/lib/api/AuthApi';

const ResetPasswordPage: React.FC = () => {
  const { token } = useSearch({ strict: false }) as { token: string };
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không khớp');
      setStatus('error');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Mật khẩu phải có ít nhất 8 ký tự');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      await resetPassword(token, password);
      setStatus('success');
      setTimeout(() => navigate({ to: '/' }), 3000);
    } catch (err: unknown) {
      setStatus('error');

      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Đã xảy ra lỗi không xác định');
      }
    }
  };

  if (!token)
    return (
      <Box p={5} textAlign="center">
        <Typography>Thiếu mã token.</Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f4f6f8',
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
          Đặt lại mật khẩu
        </Typography>

        {status === 'success' ? (
          <Alert severity="success">
            Mật khẩu đã được thay đổi thành công! Đang chuyển hướng...
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Mật khẩu mới"
              type="password"
              fullWidth
              required
              sx={{ mb: 2, mt: 2 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Nhập lại mật khẩu"
              type="password"
              fullWidth
              required
              sx={{ mb: 3 }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {status === 'error' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;
