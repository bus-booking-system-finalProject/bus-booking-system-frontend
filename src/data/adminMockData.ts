// src/data/adminMockData.ts
import type { AdminRoute, AdminBus } from '@/types/AdminTypes';

export const MOCK_ADMIN_ROUTES: AdminRoute[] = [
  { id: 1, name: 'NYC to Boston Express', origin: 'New York, NY', destination: 'Boston, MA' },
  { id: 2, name: 'SF to LA Coastal', origin: 'San Francisco, CA', destination: 'Los Angeles, CA' },
];

export const MOCK_ADMIN_BUSES: AdminBus[] = [
  { id: 101, name: 'Bus A-101', model: 'Volvo 9700', capacity: 50 },
  { id: 102, name: 'Bus B-202', model: 'Mercedes Tourismo', capacity: 40 },
];
