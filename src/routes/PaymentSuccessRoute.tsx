import { createRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { PaymentSuccessPage } from '@/pages/PaymentSuccessPage';
import { indexRoute } from './IndexRoute';

const paymentSuccessSearchSchema = z.object({
  ticketId: z.string(),
});

export const paymentSuccessRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/payment/success',
  validateSearch: (search) => paymentSuccessSearchSchema.parse(search),
  component: PaymentSuccessPage,
});
