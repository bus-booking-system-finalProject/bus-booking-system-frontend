import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BusesApi } from '@/lib/api/admin/BusesApi';
import type { Bus, SeatDefinition } from '@/types/AdminTypes';

export const busKeys = {
  all: ['buses'] as const,
  detail: (id: string) => [...busKeys.all, id] as const,
};

export const useBuses = () => {
  return useQuery({
    queryKey: busKeys.all,
    queryFn: BusesApi.getAll,
  });
};

export const useBus = (id: string) => {
  return useQuery({
    queryKey: busKeys.detail(id),
    queryFn: () => BusesApi.getById(id),
    enabled: !!id,
  });
};

export const useMutateBus = () => {
  const queryClient = useQueryClient();

  return {
    create: useMutation({
      mutationFn: BusesApi.create,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: busKeys.all }),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Bus> }) => BusesApi.update(id, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: busKeys.all }),
    }),
    delete: useMutation({
      mutationFn: BusesApi.delete,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: busKeys.all }),
    }),
    saveSeatMap: useMutation({
      mutationFn: ({ busId, seats }: { busId: string; seats: SeatDefinition[] }) =>
        BusesApi.saveSeatMap(busId, seats),
      onSuccess: (_, variables) => {
        // Invalidate specific bus to refresh data
        queryClient.invalidateQueries({ queryKey: busKeys.detail(variables.busId) });
      },
    }),
  };
};
