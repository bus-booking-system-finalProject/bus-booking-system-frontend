import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BusesApi } from '@/lib/api/admin/BusesApi';
import type { BusRequest } from '@/types/admin/BusTypes';
import { useToast } from '../useToast';
import type { ApiErrorResponse } from '@/types/CommonTypes';

export const useBuses = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const busesQuery = useQuery({
    queryKey: ['buses'],
    queryFn: BusesApi.getAll,
  });

  const createBus = useMutation({
    mutationFn: BusesApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      // Use the message from the backend response
      showToast(response.message || 'Bus created successfully', 'success');
    },
    onError: (error: ApiErrorResponse) => {
      showToast(error?.message || 'Failed to create bus', 'error');
    },
  });

  const updateBus = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BusRequest }) => BusesApi.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      showToast(response.message || 'Bus updated successfully', 'success');
    },
    onError: (error: ApiErrorResponse) => {
      showToast(error?.message || 'Failed to update bus', 'error');
    },
  });

  const deleteBus = useMutation({
    mutationFn: BusesApi.delete,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      showToast(response.message || 'Bus deleted successfully', 'success');
    },
    onError: (error: ApiErrorResponse) => {
      showToast(error?.message || 'Failed to delete bus', 'error');
    },
  });

  return { busesQuery, createBus, updateBus, deleteBus };
};
