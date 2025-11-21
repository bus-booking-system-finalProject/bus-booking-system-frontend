import { rootRoute } from './routes/root.tsx'
import { indexRoute } from './routes/index.tsx'

export const routeTree = rootRoute.addChildren([
  indexRoute,
])