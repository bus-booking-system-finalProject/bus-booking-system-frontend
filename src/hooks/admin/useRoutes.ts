import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoutesApi } from '@/lib/api/admin/RoutesApi';
import type { RouteRequest } from '@/types/admin/RouteTypes';
import { useToast } from '../useToast';
import type { ApiErrorResponse } from '@/types/CommonTypes';

export const useRoutes = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const routesQuery = useQuery({
    queryKey: ['routes'],
    queryFn: RoutesApi.getAll,
  });

  const createRoute = useMutation({
    mutationFn: RoutesApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      showToast(response?.message || 'Route created successfully', 'success');
    },
    onError: (error: ApiErrorResponse) => {
      showToast(error?.message || 'Failed to create route', 'error');
    },
  });

  const updateRoute = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RouteRequest }) =>
      RoutesApi.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      showToast(response?.message || 'Route updated successfully', 'success');
    },
    onError: (error: ApiErrorResponse) => {
      showToast(error?.message || 'Failed to update route', 'error');
    },
  });

  const deleteRoute = useMutation({
    mutationFn: RoutesApi.delete,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      showToast(response?.message || 'Route deleted successfully', 'success');
    },
    onError: (error: ApiErrorResponse) => {
      showToast(error?.message || 'Failed to delete route', 'error');
    },
  });

  return { routesQuery, createRoute, updateRoute, deleteRoute };
};