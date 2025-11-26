import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import RoleAdaptiveWidget from './RoleAdaptiveWidget';

// --- 1. Mock the AuthContext ---
// We use a mock function 'mockUser' so we can change the return value in each test
const mockUser = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser(),
  }),
}));

describe('RoleAdaptiveWidget Component', () => {
  // --- TEST CASE 1: ADMIN VIEW ---
  it('renders Admin dashboard when user role is ADMIN', () => {
    // Simulate logged-in Admin
    mockUser.mockReturnValue({ role: 'ADMIN', name: 'Admin User' });

    render(<RoleAdaptiveWidget />);

    // Check for Admin specific header
    expect(screen.getByText('Quản trị viên')).toBeInTheDocument();
    expect(screen.getByText('Bảng điều khiển hệ thống')).toBeInTheDocument();

    // Check for Admin specific actions
    expect(screen.getByText('Quản lý tuyến đường')).toBeInTheDocument();
    expect(screen.getByText('Xử lý khiếu nại')).toBeInTheDocument();
    expect(screen.getByText('Sức khỏe hệ thống')).toBeInTheDocument();
  });

  // --- TEST CASE 2: USER VIEW ---
  // (Note: Currently commented out in your source code, so we skip this test)
  // it.skip('renders User dashboard when user role is USER', () => {
  //   mockUser.mockReturnValue({ role: 'USER', name: 'Regular User' });
  //   render(<RoleAdaptiveWidget />);
  //   expect(screen.getByText('Truy cập nhanh')).toBeInTheDocument();
  //   expect(screen.getByText('Chuyến đi sắp tới')).toBeInTheDocument();
  // });

  // --- TEST CASE 3: GUEST VIEW ---
  it('renders Guest call-to-action when user is NOT logged in', () => {
    // Simulate Guest (user is null or undefined)
    mockUser.mockReturnValue(null);

    render(<RoleAdaptiveWidget />);

    // Check for Guest greeting
    expect(screen.getByText('Xin chào quý khách')).toBeInTheDocument();

    // Check for Guest message description
    expect(screen.getByText(/Đăng nhập để xem lịch sử chuyến đi/i)).toBeInTheDocument();

    // Check for Login Button
    const loginButton = screen.getByRole('button', { name: /Đăng nhập ngay/i });
    expect(loginButton).toBeInTheDocument();
  });
});
