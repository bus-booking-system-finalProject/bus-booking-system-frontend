import { apiPrivate } from '@/lib/api/axios';
import type { User, CreateUserRequest, UpdateUserRequest, ApiResponse } from '@/types/UserTypes';

const BASE_URL = '/user/admin/users';

export const UsersApi = {
  getAll: async () => {
    const response = await apiPrivate.get<ApiResponse<User[]>>(BASE_URL);
    return response.data.data;
  },

  create: async (data: CreateUserRequest) => {
    const response = await apiPrivate.post<ApiResponse<User>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: number, data: UpdateUserRequest) => {
    const response = await apiPrivate.put<ApiResponse<User>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  updateStatus: async (id: number, enabled: boolean) => {
    const response = await apiPrivate.put<ApiResponse<User>>(`${BASE_URL}/${id}/status`, {
      enabled,
    });
    return response.data.data;
  },
};
