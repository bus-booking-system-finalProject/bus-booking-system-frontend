import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoutesApi } from '@/lib/api/admin/RoutesApi';
import type { Route } from '@/types/AdminTypes';

export const routeKeys = {
  all: ['routes'] as const,
  detail: (id: string) => [...routeKeys.all, id] as const,
};

export const useRoutes = () => {
  return useQuery({
    queryKey: routeKeys.all,
    queryFn: RoutesApi.getAll,
  });
};

export const useRoute = (id: string) => {
  return useQuery({
    queryKey: routeKeys.detail(id),
    queryFn: () => RoutesApi.getById(id),
    enabled: !!id,
  });
};

export const useMutateRoute = () => {
  const queryClient = useQueryClient();

  return {
    create: useMutation({
      mutationFn: RoutesApi.create,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: routeKeys.all }),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Route> }) =>
        RoutesApi.update(id, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: routeKeys.all }),
    }),
    delete: useMutation({
      mutationFn: RoutesApi.delete,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: routeKeys.all }),
    }),
  };
};
