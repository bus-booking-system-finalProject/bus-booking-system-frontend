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

adminRoute.addChildren([dashboardRoute, tripRoute, routeRoute, operatorRoute, busRoute]);

indexRoute.addChildren([HomeRoute, oauthCallbackRoute, searchResultRoute]);

export const routeTree = rootRoute.addChildren([indexRoute, adminRoute]);
