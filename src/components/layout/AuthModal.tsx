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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FcGoogle as GoogleIcon } from 'react-icons/fc';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { LoginSchema, RegisterSchema } from '@/schemas/AuthSchema';
import { useAuth } from '@/hooks/useAuth';
import { loginUser, registerUser, forgotPassword } from '@/lib/api/AuthApi';
import type { UserProfile } from '@/types/auth';
import { getAPIUrl } from '@/config/api';
import { useNavigate } from '@tanstack/react-router';
import { UserRole } from '@/types/enum/UserRole';
// --------------------------------------------------------------------------

// --- LOGIN FORM COMPONENT ---

// 1. Forgot Password Form
function ForgotPasswordForm({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (msg) => onSuccess(msg),
    onError: (error: Error) => setErrorMsg(error.message),
  });

  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    mutation.mutate(email);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Nhập email của bạn. Chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
      </Typography>

      <TextField
        required
        label="Email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        error={!!errorMsg}
        helperText={errorMsg}
        sx={{ mb: 2 }}
      />

      <Button type="submit" variant="contained" fullWidth disabled={mutation.isPending}>
        {mutation.isPending ? <CircularProgress size={24} /> : 'Gửi liên kết'}
      </Button>

      <Button startIcon={<ArrowBackIcon />} onClick={onBack} fullWidth sx={{ mt: 2 }}>
        Quay lại đăng nhập
      </Button>
    </Box>
  );
}

// 2. Login Form (Updated to include Forgot Password link)
function LoginForm({
  onSwitch,
  onForgotPassword, // <--- New Prop
  onLoginSuccess,
}: {
  onSwitch: () => void;
  onForgotPassword: () => void; // <--- New Prop
  onLoginSuccess: (msg: string) => void;
}) {
  const [feedback, setFeedback] = useState<{ type: 'error'; message: string } | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data: { accessToken: string; user: UserProfile }) => {
      auth.login(data.user, data.accessToken);
      onLoginSuccess('Đăng nhập thành công!');
      if (data.user.role === UserRole.OPERATOR) {
        setTimeout(() => navigate({ to: '/admin' }), 1500);
      }
    },
    onError: (error: Error) => setFeedback({ type: 'error', message: error.message }),
  });

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onBlur: LoginSchema },
    onSubmit: async ({ value }) => {
      setFeedback(null);
      mutation.mutate(value);
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
    >
      <form.Field
        name="email"
        children={({ state, handleChange, handleBlur }) => (
          <TextField
            required
            label="Email"
            fullWidth
            value={state.value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            sx={{ mb: 2 }}
            error={state.meta.isTouched && !!state.meta.errors.length}
            helperText={state.meta.isTouched ? state.meta.errors[0]?.message : null}
          />
        )}
      />

      <form.Field
        name="password"
        children={({ state, handleChange, handleBlur }) => (
          <TextField
            required
            label="Mật khẩu"
            fullWidth
            type="password"
            value={state.value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            error={state.meta.isTouched && !!state.meta.errors.length}
            helperText={state.meta.isTouched ? state.meta.errors[0]?.message : null}
          />
        )}
      />

      {/* Forgot Password Link */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Typography
          variant="caption"
          color="primary"
          sx={{ cursor: 'pointer', fontWeight: 600 }}
          onClick={onForgotPassword}
        >
          Quên mật khẩu?
        </Typography>
      </Box>

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
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            Đăng ký
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
}

// 3. Register Form (Unchanged logic, just ensure success message is correct)
function RegisterForm({
  onSwitch,
  onRegisterSuccess,
}: {
  onSwitch: () => void;
  onRegisterSuccess: (msg: string) => void;
}) {
  const [feedback, setFeedback] = useState<{ type: 'error'; message: string } | null>(null);

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      // Changed message to reflect email verification
      onRegisterSuccess('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.');
    },
    onError: (error: Error) => setFeedback({ type: 'error', message: error.message }),
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
      component="form"
      sx={{ p: 2 }}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="email"
        children={({ state, handleChange, handleBlur }) => (
          <TextField
            required
            label="Email"
            fullWidth
            value={state.value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            sx={{ mb: 2 }}
            error={state.meta.isTouched && !!state.meta.errors.length}
            helperText={state.meta.isTouched ? state.meta.errors[0]?.message : null}
          />
        )}
      />
      <form.Field
        name="password"
        children={({ state, handleChange, handleBlur }) => (
          <TextField
            required
            label="Mật khẩu"
            fullWidth
            type="password"
            value={state.value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            error={state.meta.isTouched && !!state.meta.errors.length}
            helperText={state.meta.isTouched ? state.meta.errors[0]?.message : null}
          />
        )}
      />
      {feedback && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'error.main', pt: 2 }}>
          <ErrorOutlineIcon fontSize="small" />
          <Typography variant="body2">{feedback.message}</Typography>
        </Stack>
      )}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={mutation.isPending}
        sx={{ mt: 2 }}
      >
        {mutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Đăng ký'}
      </Button>
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
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            Đăng nhập
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
}

// 4. Main Modal Component
type AuthView = 'login' | 'register' | 'forgot-password';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

export default function AuthModal({ open, onClose, initialView = 'login' }: AuthModalProps) {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSwitchToRegister = () => setCurrentView('register');
  const handleSwitchToLogin = () => setCurrentView('login');
  const handleSwitchToForgot = () => setCurrentView('forgot-password');

  const handleSuccess = (msg: string) => {
    setSuccessMessage(msg);
    // If it was login success, close modal. If register success (email sent), wait.
    setTimeout(() => {
      if (currentView === 'login') onClose();
    }, 2000);
  };

  React.useEffect(() => {
    if (open) {
      setCurrentView(initialView);
      setSuccessMessage(null);
    }
  }, [open, initialView]);

  let title = 'Đăng nhập';
  if (currentView === 'register') title = 'Đăng ký';
  if (currentView === 'forgot-password') title = 'Quên mật khẩu';

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
          </Stack>
        ) : currentView === 'login' ? (
          <LoginForm
            onSwitch={handleSwitchToRegister}
            onForgotPassword={handleSwitchToForgot}
            onLoginSuccess={handleSuccess}
          />
        ) : currentView === 'register' ? (
          <RegisterForm onSwitch={handleSwitchToLogin} onRegisterSuccess={handleSuccess} />
        ) : (
          <ForgotPasswordForm onBack={handleSwitchToLogin} onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  );
}
