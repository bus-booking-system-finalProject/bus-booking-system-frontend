import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import PopularRoutes from '../components/home/PopularRoutes';

// We don't need to mock anything here because PopularRoutes uses static data
describe('PopularRoutes Component', () => {
  it('renders the section title', () => {
    render(<PopularRoutes />);
    expect(screen.getByText('Tuyến đường phổ biến')).toBeInTheDocument();
  });

  it('renders specific route cards', () => {
    render(<PopularRoutes />);

    // Check for a specific destination
    expect(screen.getByText('Sài Gòn - Nha Trang')).toBeInTheDocument();

    // Check for a specific price
    const prices = screen.getAllByText('200.000đ');
    expect(prices[0]).toBeInTheDocument();
  });

  it('renders discount price when available', () => {
    render(<PopularRoutes />);
    // Check for a discount price that exists in your mock data
    expect(screen.getByText('250.000đ')).toBeInTheDocument();
  });
});
