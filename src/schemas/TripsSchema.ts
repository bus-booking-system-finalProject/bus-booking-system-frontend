import { z } from 'zod';

export const TripSchema = z.object({
  routeId: z.string().min(1, 'Route is required'),
  busId: z.string().min(1, 'Bus is required'),
  departureTime: z.string().min(1, 'Departure time is required'),
  arrivalTime: z.string().min(1, 'Arrival time is required'),
  basePrice: z.number().min(0, 'Price must be positive'),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'DELAYED']),
});

export type TripFormValues = z.infer<typeof TripSchema>;
