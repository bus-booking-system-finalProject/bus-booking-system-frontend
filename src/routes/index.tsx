import {
  createRoute,
} from '@tanstack/react-router'
import App from '../pages/App.tsx'
import { rootRoute } from './root.tsx'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})