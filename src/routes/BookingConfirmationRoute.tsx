import { createRoute } from '@tanstack/react-router';
import { indexRoute } from './IndexRoute';
import { BookingConfirmationPage } from '@/pages/BookingConfirmationPage';

export const bookingConfirmationRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/booking/confirmation',
  component: BookingConfirmationPage,
});
