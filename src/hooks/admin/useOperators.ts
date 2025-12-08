import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OperatorsApi } from '@/lib/api/OperatorsApi';
import type { Operator } from '@/types/AdminTypes';

export const operatorKeys = {
  all: ['operators'] as const,
  detail: (id: string) => [...operatorKeys.all, id] as const,
};

export const useOperators = () => {
  return useQuery({
    queryKey: operatorKeys.all,
    queryFn: OperatorsApi.getAll,
  });
};

export const useOperator = (id: string) => {
  return useQuery({
    queryKey: operatorKeys.detail(id),
    queryFn: () => OperatorsApi.getById(id),
    enabled: !!id,
  });
};

export const useMutateOperator = () => {
  const queryClient = useQueryClient();

  return {
    create: useMutation({
      mutationFn: OperatorsApi.create,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: operatorKeys.all }),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Operator> }) =>
        OperatorsApi.update(id, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: operatorKeys.all }),
    }),
    delete: useMutation({
      mutationFn: OperatorsApi.delete,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: operatorKeys.all }),
    }),
  };
};
