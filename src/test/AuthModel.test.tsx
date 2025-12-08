import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import AuthModal from '../components/layout/AuthModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the auth API
vi.mock('@/lib/api/auth', () => ({
  loginUser: vi.fn().mockResolvedValue({ role: 'USER', email: 'test@test.com' }),
  registerUser: vi.fn().mockResolvedValue({}),
  getMe: vi.fn().mockResolvedValue({ role: 'USER', email: 'test@test.com' }),
}));

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock AuthProvider to just pass children through
vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderModal = (open = true) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthModal open={open} onClose={vi.fn()} />
    </QueryClientProvider>,
  );
};

describe('AuthModal Integration', () => {
  it('renders login form by default', () => {
    renderModal();
    const headings = screen.getAllByRole('heading', { name: 'Đăng nhập' });
    expect(headings[0]).toBeInTheDocument();
  });

  it('switches to register form when clicking link', async () => {
    renderModal();

    const registerLink = screen.getByText('Đăng ký');
    fireEvent.click(registerLink);

    await waitFor(() => {
      const headings = screen.getAllByRole('heading', { name: 'Đăng ký' });
      expect(headings[0]).toBeInTheDocument();
    });
  });

  it('validates empty inputs', async () => {
    renderModal();

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.focus(emailInput);
    fireEvent.blur(emailInput);

    const errorMsg = await screen.findByText(/Email is required/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('closes modal on successful login', async () => {
    const onCloseMock = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <AuthModal open={true} onClose={onCloseMock} />
      </QueryClientProvider>,
    );

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Đăng nhập/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Wait for async login to complete
    await waitFor(
      () => {
        expect(onCloseMock).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });
});
