import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // Keep for clicks
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, test, expect, vi, beforeEach, type Mock, afterEach } from 'vitest';

import AuthModal from '@/components/layout/AuthModal';
import { loginUser, registerUser } from '@/lib/api/AuthApi';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';

// --- MOCKS ---
vi.mock('@/lib/api/AuthApi', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('@/config/api', () => ({
  getAPIUrl: (path: string) => `http://mock-api/${path}`,
}));

describe('AuthModal Component', () => {
  const mockOnClose = vi.fn();
  const mockLogin = vi.fn();
  const mockNavigate = vi.fn();
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    // 1. Force Fake Timers to intercept setTimeout
    vi.useFakeTimers({ shouldAdvanceTime: true });

    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    (useAuth as Mock).mockReturnValue({
      login: mockLogin,
      isLoggedIn: false,
      user: null,
      logout: vi.fn(),
    });

    (useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const setup = (props: Partial<React.ComponentProps<typeof AuthModal>> = {}) => {
    // 2. Setup userEvent for clicks (interactions), but we will use fireEvent for typing
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const utils = render(
      <QueryClientProvider client={queryClient}>
        <AuthModal open={true} onClose={mockOnClose} initialView="login" {...props} />
      </QueryClientProvider>,
    );
    return { user, ...utils };
  };

  // --- TESTS ---

  describe('Rendering & Navigation', () => {
    test('does not render when open is false', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <AuthModal open={false} onClose={mockOnClose} />
        </QueryClientProvider>,
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('renders Login form by default', () => {
      setup();
      expect(screen.getByRole('heading', { name: /đăng nhập/i, level: 6 })).toBeInTheDocument();
    });

    test('renders Google OAuth button with correct link', () => {
      setup();
      const googleBtn = screen.getByRole('link', { name: /đăng nhập với google/i });
      expect(googleBtn).toHaveAttribute('href', 'http://mock-api/user/oauth2/authorization/google');
    });

    test('switches to Register form when "Đăng ký" is clicked', async () => {
      const { user } = setup();

      await user.click(screen.getByText('Đăng ký'));

      // Use findByRole to wait for the UI update
      expect(
        await screen.findByRole('heading', { name: /đăng ký/i, level: 6 }),
      ).toBeInTheDocument();
    });

    test('resets to initialView when modal is closed and re-opened', async () => {
      const { user, rerender } = setup();

      // 1. Switch to Register
      await user.click(screen.getByText('Đăng ký'));
      expect(
        await screen.findByRole('heading', { name: /đăng ký/i, level: 6 }),
      ).toBeInTheDocument();

      // 2. Close Modal
      rerender(
        <QueryClientProvider client={queryClient}>
          <AuthModal open={false} onClose={mockOnClose} initialView="login" />
        </QueryClientProvider>,
      );

      // 3. Re-open Modal
      rerender(
        <QueryClientProvider client={queryClient}>
          <AuthModal open={true} onClose={mockOnClose} initialView="login" />
        </QueryClientProvider>,
      );

      // 4. Back to Login
      expect(screen.getByRole('heading', { name: /đăng nhập/i, level: 6 })).toBeInTheDocument();
    });
  });

  describe('Login Functionality', () => {
    test('shows loading state while mutation is pending', async () => {
      const { user } = setup();
      (loginUser as Mock).mockReturnValue(new Promise(() => {})); // Never resolves

      // Use fireEvent for instant input (prevents userEvent timeout issues)
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

      await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      const progressBar = screen.getByRole('progressbar');
      const button = progressBar.closest('button');
      expect(button).toBeDisabled();
    });

    test('submits form with valid data and handles success (Instant)', async () => {
      const { user } = setup();

      const mockUser = { id: '1', email: 'test@example.com', role: 'USER' };
      (loginUser as Mock).mockResolvedValue({ user: mockUser, accessToken: 'token' });

      // Use fireEvent for speed
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

      await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/login successfully/i)).toBeInTheDocument();
      });

      expect(mockLogin).toHaveBeenCalledWith(mockUser, 'token');

      // 3. FORCE SKIP TIME: This mimics 2 seconds passing instantly
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    test('navigates to admin dashboard if user is ADMIN (Instant)', async () => {
      const { user } = setup();

      const mockAdmin = { id: '2', email: 'admin@example.com', role: 'ADMIN' };
      (loginUser as Mock).mockResolvedValue({ user: mockAdmin, accessToken: 'token' });

      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'admin@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'adminpass' } });

      await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));

      await waitFor(() => {
        expect(screen.getByText(/login successfully/i)).toBeInTheDocument();
      });

      // 4. FORCE SKIP TIME: Mimic 1.5 seconds passing instantly
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/admin' });
    });

    test('handles login API error', async () => {
      const { user } = setup();
      (loginUser as Mock).mockRejectedValue(new Error('Invalid credentials'));

      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });

      await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));

      expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  describe('Register Functionality', () => {
    test('submits registration and switches to login on success (Instant)', async () => {
      const { user } = setup({ initialView: 'register' });

      (registerUser as Mock).mockResolvedValue({
        user: { id: 'new', email: 'new@example.com', role: 'USER' },
      });

      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'newpass123' } });

      await user.click(screen.getByRole('button', { name: 'Đăng ký' }));

      await waitFor(() => {
        expect(screen.getByText(/create a new account successfully/i)).toBeInTheDocument();
      });

      // 5. FORCE SKIP TIME: Mimic 1.5 seconds passing instantly
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(screen.getByRole('heading', { name: /đăng nhập/i, level: 6 })).toBeInTheDocument();
    });

    test('handles registration API error', async () => {
      const { user } = setup({ initialView: 'register' });
      (registerUser as Mock).mockRejectedValue(new Error('Email already exists'));

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'existing@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'validPass123' } });

      await user.click(screen.getByRole('button', { name: 'Đăng ký' }));

      expect(await screen.findByText('Email already exists')).toBeInTheDocument();
    });
  });
});
