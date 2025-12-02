import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TripsApi } from '@/lib/api/TripsApi';
import type { Trip, TripSearchRequest } from '@/types/AdminTypes';

export const tripKeys = {
  all: ['trips'] as const, // Generic key for list
  search: (params: TripSearchRequest) => [...tripKeys.all, 'search', params] as const,
  detail: (id: string) => [...tripKeys.all, id] as const,
  seats: (id: string) => [...tripKeys.all, id, 'seats'] as const,
};

// --- QUERIES ---

// 1. Search Trips (Public)
export const useSearchTrips = (params: TripSearchRequest) => {
  return useQuery({
    queryKey: tripKeys.search(params),
    queryFn: () => TripsApi.search(params),
    // Keep previous data while fetching new page to avoid flicker
    placeholderData: (previousData) => previousData, 
  });
};

// 2. Get Single Trip Detail
export const useTrip = (id: string) => {
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: () => TripsApi.getById(id),
    enabled: !!id,
  });
};

// 3. Get Seat Map for a Trip
export const useTripSeatMap = (tripId: string) => {
  return useQuery({
    queryKey: tripKeys.seats(tripId),
    queryFn: () => TripsApi.getSeatMap(tripId),
    enabled: !!tripId,
  });
};

// --- MUTATIONS (Admin) ---

export const useMutateTrip = () => {
  const queryClient = useQueryClient();

  return {
    create: useMutation({
      mutationFn: TripsApi.create,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: tripKeys.all }),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Trip> }) =>
        TripsApi.update(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: tripKeys.all });
        queryClient.invalidateQueries({ queryKey: tripKeys.detail(variables.id) });
      },
    }),
    delete: useMutation({
      mutationFn: TripsApi.delete,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: tripKeys.all }),
    }),
  };
};