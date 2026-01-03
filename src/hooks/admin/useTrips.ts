import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TripsApi } from '../../lib/api/admin/TripsApi';
import type { TripCreateRequest, TripUpdateRequest } from '../../types/admin/TripTypes';
import { useToast } from '../useToast';
import type { ApiErrorResponse } from '@/types/CommonTypes';

export const useTrips = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    // 1. Get All Trips
    const tripsQuery = useQuery({
        queryKey: ['admin-trips'],
        queryFn: TripsApi.getAll,
    });

    // 2. Get Single Trip Details
    const useTripDetails = (id: string | null) => useQuery({
        queryKey: ['admin-trip', id],
        queryFn: () => TripsApi.getById(id!),
        enabled: !!id,
        staleTime: 0,
    });

    // 3. Create Trip
    const createTrip = useMutation({
        mutationFn: (data: TripCreateRequest) => TripsApi.create(data),
        onSuccess: (_) => {
            queryClient.invalidateQueries({ queryKey: ['admin-trips'] });
            showToast('The new trip has been successfully scheduled.', 'success');
        },
        onError: (error: ApiErrorResponse) => {
            showToast(error?.message || 'Failed to create trip', 'error');
        },
    });

    // 4. Update Trip (Now uses TripUpdateRequest)
    const updateTrip = useMutation({
        mutationFn: ({ id, data }: { id: string; data: TripUpdateRequest }) =>
            TripsApi.update({ id, data }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin-trips'] });
            queryClient.invalidateQueries({ queryKey: ['admin-trip', variables.id] });
            showToast('Trip details have been updated.', 'success');
        },
        onError: (error: ApiErrorResponse) => {
            showToast(error?.message || 'Could not update trip', 'error');
        },
    });

    // 5. Delete Trip
    const deleteTrip = useMutation({
        mutationFn: (id: string) => TripsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-trips'] });
            showToast('The trip has been removed successfully.', 'success');
        },
        onError: (error: ApiErrorResponse) => {
            showToast(error?.message || 'Could not delete trip', 'error');
        },
    });

    return {
        tripsQuery,
        useTripDetails,
        createTrip,
        updateTrip,
        deleteTrip,
    };
};