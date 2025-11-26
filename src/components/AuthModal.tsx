import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Stack,
  Button,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { FcGoogle as GoogleIcon } from 'react-icons/fc';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { LoginSchema, RegisterSchema } from '@/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { loginUser, registerUser } from '@/lib/api/auth';
import type { UserProfile } from '@/types/auth';
import { getAPIUrl } from '@/config/api';
import { useNavigate } from '@tanstack/react-router';
// --------------------------------------------------------------------------

// --- LOGIN FORM COMPONENT ---

function LoginForm({
  onSwitch,
  onLoginSuccess,
}: {
  onSwitch: () => void;
  onLoginSuccess: (msg: string) => void;
}) {
  const [feedback, setFeedback] = useState<{
    type: 'error';
    message: string;
  } | null>(null);
  const auth = useAuth(); // Consume Auth Context
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginUser,
    // Update the data type here
    onSuccess: (data: { accessToken: string; user: UserProfile }) => {
      // 1. Call global login with BOTH user and token
      auth.login(data.user, data.accessToken);

      // 2. Report success
      onLoginSuccess('Login successfully!');
      form.reset();

      // 3. Navigation logic
      if (data.user.role === 'ADMIN') {
        setTimeout(() => {
          navigate({ to: '/dashboard' });
        }, 1500);
      }
    },
    onError: (error: Error) => {
      setFeedback({ type: 'error', message: error.message });
    },
  });

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onBlur: LoginSchema },
    onSubmit: async ({ value }) => {
      setFeedback(null); // Clear previous errors
      mutation.mutate(value); // Trigger the API call
    },
  });

  return (
    <Box
      component="form"
      sx={{ p: 2 }}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="email"
        children={({ state, handleChange, handleBlur }) => {
          const hasError = state.meta.isTouched && !!state.meta.errors.length;
          return (
            <TextField
              required
              id="email"
              label="Email"
              fullWidth
              variant="outlined"
              value={state.value} // Use 'value' for controlled component
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="you@example.com"
              sx={{ mb: 2 }}
              error={hasError}
              helperText={hasError ? state.meta.errors[0]?.message : null}
            />
          );
        }}
      />

      <form.Field
        name="password"
        children={({ state, handleChange, handleBlur }) => {
          const hasError = state.meta.isTouched && !!state.meta.errors.length;
          return (
            <TextField
              required
              id="password"
              label="Password"
              fullWidth
              variant="outlined"
              value={state.value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="••••••••"
              type="password"
              error={hasError}
              helperText={hasError ? state.meta.errors[0]?.message : null}
            />
          );
        }}
      />

      {/* Display validation or API errors */}
      {feedback && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'error.main', pt: 2 }}>
          <ErrorOutlineIcon fontSize="small" />
          <Typography variant="body2">{feedback.message}</Typography>
        </Stack>
      )}

      <form.Subscribe selector={(state) => [state.isSubmitting]}>
        {() => (
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={mutation.isPending}
            sx={{ mt: 2 }}
          >
            {mutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập'}
          </Button>
        )}
      </form.Subscribe>

      <Divider sx={{ my: 2 }}>hoặc</Divider>
      <Button
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
        href={getAPIUrl('user/oauth2/authorization/google')}
      >
        Đăng nhập với Google
      </Button>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Bạn chưa có tài khoản?{' '}
          <Typography
            component="span"
            variant="body2"
            fontWeight="bold"
            color="primary"
            onClick={onSwitch}
            sx={{
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Đăng ký
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
}

// --- REGISTER FORM COMPONENT ---

function RegisterForm({
  onSwitch,
  onRegisterSuccess,
}: {
  onSwitch: () => void;
  onRegisterSuccess: (msg: string) => void;
}) {
  const [feedback, setFeedback] = useState<{
    type: 'error';
    message: string;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (_) => {
      onRegisterSuccess('Create a new account successfully!');
      form.reset();
    },
    onError: (error: Error) => {
      // This will show errors from NestJS (e.g., "Email already exists")
      setFeedback({ type: 'error', message: error.message });
    },
  });

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onBlur: RegisterSchema },
    onSubmit: async ({ value }) => {
      setFeedback(null);
      mutation.mutate(value);
    },
  });

  return (
    <Box
      sx={{ p: 2 }}
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="email"
        children={({ state, handleChange, handleBlur }) => {
          const hasError = state.meta.isTouched && !!state.meta.errors.length;
          return (
            <TextField
              required
              id="email"
              label="Email"
              fullWidth
              variant="outlined"
              value={state.value} // Use 'value' for controlled component
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="you@example.com"
              sx={{ mb: 2 }}
              error={hasError}
              helperText={hasError ? state.meta.errors[0]?.message : null}
            />
          );
        }}
      />

      <form.Field
        name="password"
        children={({ state, handleChange, handleBlur }) => {
          const hasError = state.meta.isTouched && !!state.meta.errors.length;
          return (
            <TextField
              required
              id="password"
              label="Password"
              fullWidth
              variant="outlined"
              value={state.value} // Use 'value' for controlled component
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="••••••••"
              type="password"
              error={hasError}
              helperText={hasError ? state.meta.errors[0]?.message : null}
            />
          );
        }}
      />

      {feedback && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'error.main', pt: 2 }}>
          <ErrorOutlineIcon fontSize="small" />
          <Typography variant="body2">{feedback.message}</Typography>
        </Stack>
      )}

      <form.Subscribe selector={(state) => [state.isSubmitting]}>
        {() => (
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={mutation.isPending}
            sx={{ mt: 2 }}
          >
            {mutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Đăng ký'}
          </Button>
        )}
      </form.Subscribe>

      <Divider sx={{ my: 2 }}>hoặc</Divider>

      <Button
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
        href={getAPIUrl('user/oauth2/authorization/google')}
      >
        Tiếp tục với Google
      </Button>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Bạn đã có tài khoản?{' '}
          <Typography
            component="span"
            variant="body2"
            fontWeight="bold"
            color="primary"
            onClick={onSwitch}
            sx={{
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Đăng nhập
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
}

// --- AUTH MODAL WRAPPER (Manages 'login'/'register'/'success' views) ---

type AuthView = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

export default function AuthModal({ open, onClose, initialView = 'login' }: AuthModalProps) {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSwitchView = () => {
    setSuccessMessage(null); // Clear success message on switch
    setCurrentView((prev) => (prev === 'login' ? 'register' : 'login'));
  };

  const handleLoginSuccess = (msg: string) => {
    setSuccessMessage(msg);
    // Close the modal after a short delay on successful login
    setTimeout(onClose, 2000);
  };

  const handleRegisterSuccess = (msg: string) => {
    setSuccessMessage(msg);
    // Switch to login view after successful registration
    setTimeout(() => {
      setSuccessMessage(null);
      setCurrentView('login');
    }, 1500);
  };

  const title = currentView === 'login' ? 'Đăng nhập' : 'Đăng ký';

  // Reset the view when the modal is re-opened
  React.useEffect(() => {
    if (open) {
      setCurrentView(initialView);
      setSuccessMessage(null); // Reset success message
    }
  }, [open, initialView]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {successMessage ? (
          // --- Success View ---
          <Stack
            direction="column"
            alignItems="center"
            spacing={2}
            sx={{ py: 4, textAlign: 'center' }}
          >
            <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 60 }} />
            <Typography variant="h6" color="success.main">
              {successMessage}
            </Typography>
            <CircularProgress size={20} />
          </Stack>
        ) : currentView === 'login' ? (
          // --- Login View ---
          <LoginForm onSwitch={handleSwitchView} onLoginSuccess={handleLoginSuccess} />
        ) : (
          // --- Register View ---
          <RegisterForm onSwitch={handleSwitchView} onRegisterSuccess={handleRegisterSuccess} />
        )}
      </DialogContent>
    </Dialog>
  );
}
