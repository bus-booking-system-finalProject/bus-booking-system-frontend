import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { CircularProgress, Box, Typography } from '@mui/material';
import { apiClient } from '@/lib/api/axios';

function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      // Manually set cookies so apiClient can pick them up immediately
      // (Set appropriate secure/path attributes as needed for your env)
      document.cookie = `accessToken=${accessToken}; path=/; max-age=3600`;
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800`;

      // Fetch user profile using the new token to sync AuthContext
      apiClient
        .get('/user/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          login(res.data, accessToken);
          navigate({ to: '/' }); // Redirect to home
        })
        .catch((err) => {
          console.error('OAuth profile fetch failed', err);
          navigate({ to: '/' });
        });
    } else {
      navigate({ to: '/' });
    }
  }, [login, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Completing Login...</Typography>
    </Box>
  );
}

export default OAuthCallback;
