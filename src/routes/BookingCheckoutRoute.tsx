// src/routes/BookingCheckoutRoute.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './RootRoute';
import BookingCheckoutPage from '@/pages/BookingCheckoutPage';
import { z } from 'zod';

// UPDATED: Now we only need the ticketId in the URL
const checkoutSearchSchema = z.object({
  ticketId: z.string(),
});

export const bookingCheckoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/booking/checkout',
  validateSearch: (search) => checkoutSearchSchema.parse(search),
  component: BookingCheckoutPage,
});
