import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BusModelsApi } from '@/lib/api/admin/BusModelsApi';
import type { BusModelRequest } from '@/types/admin/BusTypes';
import { useToast } from '../useToast';
import type { ApiErrorResponse } from '@/types/CommonTypes';

export const useBusModels = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const busModelsQuery = useQuery({
    queryKey: ['busModels'],
    queryFn: BusModelsApi.getAll,
  });

  const useBusModelDetails = (id: string | null) =>
    useQuery({
      queryKey: ['busModelDetails', id],
      queryFn: () => BusModelsApi.getDetails(id!),
      enabled: !!id, // Only fetch if ID is present
      staleTime: 0, // Always fetch fresh details on open
    });

  const createBusModel = useMutation({
    mutationFn: (data: { model: BusModelRequest; images: File[] }) => BusModelsApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['busModels'] });
      showToast(res.message || 'Bus Model created successfully', 'success');
    },
    onError: (err: ApiErrorResponse) => showToast(err?.message || 'Failed to create', 'error'),
  });

  const updateBusModel = useMutation({
    mutationFn: ({ id, data, images }: { id: string; data: BusModelRequest; images: File[] }) =>
      BusModelsApi.update(id, { model: data, images }),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['busModels'] });
      queryClient.invalidateQueries({ queryKey: ['busModelDetails', variables.id] });
      showToast(res.message || 'Bus Model updated successfully', 'success');
    },
    onError: (err: ApiErrorResponse) => showToast(err?.message || 'Failed to update', 'error'),
  });

  const deleteBusModel = useMutation({
    mutationFn: BusModelsApi.delete,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['busModels'] });
      showToast(res.message || 'Bus Model deleted successfully', 'success');
    },
    onError: (err: ApiErrorResponse) => showToast(err?.message || 'Failed to delete', 'error'),
  });

  return { busModelsQuery, useBusModelDetails, createBusModel, updateBusModel, deleteBusModel };
};
