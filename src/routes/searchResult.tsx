import { createRoute } from '@tanstack/react-router';
import SearchResultsPage from '../pages/SearchResultsPage.tsx';
import { z } from 'zod'; // You probably have zod installed

// 1. Define the Schema for Query Params
const tripSearchSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  date: z.string().optional(),
  returnDate: z.string().optional(),
  page: z.number().default(1).optional(),
  limit: z.number().default(5).optional(),
  sort: z.enum(['earliest', 'latest', 'lowest_price', 'highest_rating']).optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  operators: z.union([z.string(), z.array(z.string())]).optional(),
  busTypes: z.union([z.string(), z.array(z.string())]).optional(),
  times: z.union([z.string(), z.array(z.string())]).optional(),
});
import Header from '@/components/layout/Header.tsx';
import { rootRoute } from './RootRoute.tsx';

export const searchResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search-results',
  // 2. Add validation for search params
  validateSearch: (search) => tripSearchSchema.parse(search),
  component: () => (
    <>
      <Header />
      <SearchResultsPage />
    </>
  ),
});
