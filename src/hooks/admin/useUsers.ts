import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersApi } from '@/lib/api/admin/UsersApi';
import type { UpdateUserRequest } from '@/types/UserTypes';

// 1. Define Query Keys
export const userKeys = {
  all: ['admin-users'] as const,
  detail: (id: number) => [...userKeys.all, id] as const,
};

// 2. Query Hook (Fetch List)
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: UsersApi.getAll,
  });
};

// 3. Mutation Hook (Create, Update, Delete/Status)
export const useMutateUser = () => {
  const queryClient = useQueryClient();

  return {
    create: useMutation({
      mutationFn: UsersApi.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: userKeys.all });
      },
    }),

    update: useMutation({
      mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
        UsersApi.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: userKeys.all });
      },
    }),

    toggleStatus: useMutation({
      mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
        UsersApi.updateStatus(id, enabled),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: userKeys.all });
      },
    }),
  };
};
