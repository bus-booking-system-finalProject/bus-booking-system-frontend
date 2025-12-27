// src/routes/BookingCheckoutRoute.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './RootRoute';
import BookingCheckoutPage from '@/pages/BookingCheckoutPage';
import { z } from 'zod';

const checkoutSearchSchema = z.object({
  ticketId: z.string(),
  code: z.string().optional(),
  id: z.string().optional(),
  cancel: z.boolean().optional(),
  status: z.string().optional(),
  orderCode: z.number().optional(),
});

export const bookingCheckoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/booking/checkout',
  validateSearch: (search) => checkoutSearchSchema.parse(search),
  component: BookingCheckoutPage,
});
