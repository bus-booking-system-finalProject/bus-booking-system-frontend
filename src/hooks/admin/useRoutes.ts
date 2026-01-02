import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoutesApi } from '@/lib/api/admin/RoutesApi';
import type { RouteRequest } from '@/types/admin/RouteTypes';

export const useRoutes = () => {
  const queryClient = useQueryClient();

  const routesQuery = useQuery({
    queryKey: ['routes'],
    queryFn: RoutesApi.getAll,
  });

  const createRoute = useMutation({
    mutationFn: RoutesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  });

  const updateRoute = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RouteRequest }) =>
      RoutesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  });

  const deleteRoute = useMutation({
    mutationFn: RoutesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  });

  return { routesQuery, createRoute, updateRoute, deleteRoute };
};