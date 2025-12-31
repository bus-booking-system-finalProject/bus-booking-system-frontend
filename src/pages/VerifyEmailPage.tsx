import React, { useEffect, useState } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { Box, Paper, Typography, CircularProgress, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { verifyEmail } from '@/lib/api/AuthApi';

const VerifyEmailPage: React.FC = () => {
  const { token } = useSearch({ strict: false }) as { token?: string };
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error',
  );
  const [message, setMessage] = useState(token ? '' : 'Không tìm thấy mã xác thực.');

  useEffect(() => {
    if (!token) return;

    verifyEmail(token)
      .then((msg) => {
        setStatus('success');
        setMessage(msg);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message);
      });
  }, [token]);

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
      <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center', maxWidth: 400 }}>
        {status === 'loading' && <CircularProgress />}

        {status === 'success' && (
          <>
            <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Xác thực thành công!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Button variant="contained" onClick={() => navigate({ to: '/' })}>
              Về trang chủ
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Xác thực thất bại
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Button variant="outlined" onClick={() => navigate({ to: '/' })}>
              Về trang chủ
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default VerifyEmailPage;
