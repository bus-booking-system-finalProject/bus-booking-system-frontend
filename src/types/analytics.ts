// src/types/analytics.ts

export interface AnalyticsSummary {
  totalTickets: number;
  confirmedTickets: number;
  pendingTickets: number;
  cancelledTickets: number;
  completedTickets: number;
  totalRevenue: number;
}

export interface RevenueTrend {
  date: string; // YYYY-MM-DD
  totalRevenue: number;
  bookingCount: number;
}

export interface PopularRoute {
  routeName: string;
  totalBookings: number;
  totalRevenue: number;
}

export interface ConversionRate {
  totalSearches: number;
  totalBookings: number;
  conversionRatePercentage: number;
}

export interface AnalyticsParams {
  startDate?: string; // ISO Date string YYYY-MM-DD
  endDate?: string;
}

// Standard API Response wrapper (based on your backend)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
