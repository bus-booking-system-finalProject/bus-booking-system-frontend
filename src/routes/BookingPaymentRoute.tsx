import { createRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { PaymentGatewayPage } from '@/pages/PaymentGatewayPage';
import { indexRoute } from './IndexRoute';

const checkoutSearchSchema = z.object({
  ticketId: z.string(),
});

export const bookingPaymentRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/booking/payment',
  validateSearch: (search) => checkoutSearchSchema.parse(search),
  component: PaymentGatewayPage,
});
