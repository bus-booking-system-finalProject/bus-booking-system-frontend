import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StationsApi } from '@/lib/api/admin/StationsApi';
import type { StationRequest } from '@/types/admin/StationTypes';

export const useStations = () => {
    const queryClient = useQueryClient();

    const stationsQuery = useQuery({
        queryKey: ['stations'],
        queryFn: StationsApi.getAll,
    });

    const createStation = useMutation({
        mutationFn: StationsApi.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stations'] }),
    });

    const updateStation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: StationRequest }) =>
            StationsApi.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stations'] }),
    });

    const deleteStation = useMutation({
        mutationFn: StationsApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stations'] }),
    });

    return { stationsQuery, createStation, updateStation, deleteStation };
};