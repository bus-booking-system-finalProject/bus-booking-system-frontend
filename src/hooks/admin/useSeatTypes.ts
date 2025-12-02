import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SeatTypesApi } from '@/lib/api/SeatTypesApi';

export const seatTypeKeys = {
  all: ['seatTypes'] as const,
  byOperator: (operatorId: string) => [...seatTypeKeys.all, 'operator', operatorId] as const,
};

export const useSeatTypesByOperator = (operatorId: string) => {
  return useQuery({
    queryKey: seatTypeKeys.byOperator(operatorId),
    queryFn: () => SeatTypesApi.getByOperator(operatorId),
    enabled: !!operatorId,
  });
};

export const useMutateSeatType = () => {
  const queryClient = useQueryClient();

  return {
    create: useMutation({
      mutationFn: SeatTypesApi.create,
      onSuccess: (_, variables) => {
        // We assume we know the operatorId from variables to invalidate efficiently
        queryClient.invalidateQueries({ queryKey: seatTypeKeys.byOperator(variables.operatorId) });
      },
    }),
    delete: useMutation({
      mutationFn: SeatTypesApi.delete,
      onSuccess: () => {
        // Ideally we invalidate just the specific operator, but 'all' works safely
        queryClient.invalidateQueries({ queryKey: seatTypeKeys.all });
      },
    }),
  };
};