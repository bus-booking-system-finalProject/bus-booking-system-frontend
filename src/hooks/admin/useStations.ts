import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StationsApi } from '@/lib/api/admin/StationsApi';
import type { StationRequest } from '@/types/admin/StationTypes';
import { useToast } from '../useToast';
import type { ApiErrorResponse } from '@/types/CommonTypes';

export const useStations = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const stationsQuery = useQuery({
    queryKey: ['stations'],
    queryFn: StationsApi.getAll,
  });

  const createStation = useMutation({
    mutationFn: StationsApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      showToast(response?.message || 'Station created successfully', 'success');
    },
    onError: (error: ApiErrorResponse) => {
      showToast(error?.message || 'Failed to create station', 'error');
    },
  });

  const updateStation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StationRequest }) =>
      StationsApi.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      showToast(response?.message || 'Station updated successfully', 'success');
    },
    onError: (error: ApiErrorResponse) => {
      showToast(error?.message || 'Failed to update station', 'error');
    },
  });

  const deleteStation = useMutation({
    mutationFn: StationsApi.delete,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      showToast(response?.message || 'Station deleted successfully', 'success');
    },
    onError: (error: ApiErrorResponse) => {
      showToast(error?.message || 'Failed to delete station', 'error');
    },
  });

  return { stationsQuery, createStation, updateStation, deleteStation };
};
