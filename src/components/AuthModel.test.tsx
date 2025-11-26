import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import AuthModal from './AuthModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext'; // Import AuthProvider

// Mocking remains the same...
vi.mock('@/lib/api/auth', () => ({
  loginUser: vi.fn().mockResolvedValue({ role: 'USER', email: 'test@test.com' }),
  registerUser: vi.fn().mockResolvedValue({}),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn() }),
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
      <AuthProvider>
        <AuthModal open={open} onClose={vi.fn()} />
      </AuthProvider>
    </QueryClientProvider>,
  );
};

describe('AuthModal Integration', () => {
  it('renders login form by default', () => {
    renderModal();
    // Use getAll because there might be multiple headers (DialogTitle + Form Header)
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

    // 1. Find the input
    const emailInput = screen.getByLabelText(/Email/i);

    // 2. Simulate user interaction: Click inside (Focus) then click out (Blur)
    // This satisfies the "isTouched" requirement in your code
    fireEvent.focus(emailInput);
    fireEvent.blur(emailInput);

    // 3. Now the error message should appear
    const errorMsg = await screen.findByText(/Email is required/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('closes modal on successful login', async () => {
    const onCloseMock = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthModal open={true} onClose={onCloseMock} />
        </AuthProvider>
      </QueryClientProvider>,
    );

    // Fill in the login form
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));

    // Wait for the success message and modal close
    await waitFor(() => {
      expect(screen.getByText(/Login successfully!/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled();
    });
  });
});
