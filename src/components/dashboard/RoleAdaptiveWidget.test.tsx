import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import RoleAdaptiveWidget from './RoleAdaptiveWidget';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useAuth hook
const mockUser = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser(),
  }),
}));

// Mock AuthProvider to bypass internal useAuth call
vi.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Create a wrapper for tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const testQueryClient = createTestQueryClient();
  return <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>;
};

describe('RoleAdaptiveWidget Component', () => {
  it('renders Admin dashboard when user role is ADMIN', () => {
    mockUser.mockReturnValue({ role: 'ADMIN', name: 'Admin User' });

    render(<RoleAdaptiveWidget />, { wrapper: TestWrapper });

    expect(screen.getByText('Quản trị viên')).toBeInTheDocument();
    expect(screen.getByText('Bảng điều khiển hệ thống')).toBeInTheDocument();
    expect(screen.getByText('Quản lý tuyến đường')).toBeInTheDocument();
    expect(screen.getByText('Xử lý khiếu nại')).toBeInTheDocument();
    expect(screen.getByText('Sức khỏe hệ thống')).toBeInTheDocument();
  });

  it('renders Guest call-to-action when user is NOT logged in', () => {
    mockUser.mockReturnValue(null);

    render(<RoleAdaptiveWidget />, { wrapper: TestWrapper });

    expect(screen.getByText('Xin chào quý khách')).toBeInTheDocument();
    expect(screen.getByText(/Đăng nhập để xem lịch sử chuyến đi/i)).toBeInTheDocument();
    const loginButton = screen.getByRole('button', { name: /Đăng nhập ngay/i });
    expect(loginButton).toBeInTheDocument();
  });
});
