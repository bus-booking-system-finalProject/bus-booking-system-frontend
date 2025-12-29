import { rootRoute } from './routes/RootRoute.tsx';
import { indexRoute } from './routes/IndexRoute.tsx';
import { oauthCallbackRoute } from './routes/oauthCallback.tsx';
import { searchResultRoute } from './routes/searchResult.tsx';
import { HomeRoute } from './routes/HomeRoute.tsx';
import { adminRoute } from './routes/admin/AdminRoute.tsx';
import { dashboardRoute } from './routes/admin/DashboardRoute.tsx';
import { tripRoute } from './routes/admin/TripRoute.tsx';
import { routeRoute } from './routes/admin/RouteRoute.tsx';
import { operatorRoute } from './routes/admin/OperatorRoute.tsx';
import { busRoute } from './routes/admin/BusRoute.tsx';
import { bookingCheckoutRoute } from './routes/BookingCheckoutRoute.tsx';
import { findTicketRoute } from './routes/FindTicketRoute.tsx';
import { historyRoute } from './routes/HistoryRoute.tsx';
import { analyticsRoute } from './routes/admin/AnalyticsRoute.tsx';
import { bookingConfirmationRoute } from './routes/BookingConfirmationRoute.tsx';
import { bookingPaymentRoute } from './routes/BookingPaymentRoute.tsx';

export const routeTree = rootRoute.addChildren([
  searchResultRoute,
  indexRoute.addChildren([
    HomeRoute,
    oauthCallbackRoute,
    bookingConfirmationRoute,
    bookingCheckoutRoute,
    bookingPaymentRoute,
    findTicketRoute,
    historyRoute,
  ]),
  adminRoute.addChildren([
    dashboardRoute,
    tripRoute,
    routeRoute,
    operatorRoute,
    busRoute,
    analyticsRoute,
  ]),
]);
