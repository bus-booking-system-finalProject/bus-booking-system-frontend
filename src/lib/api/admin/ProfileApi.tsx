import { apiPrivate } from '@/lib/api/axios';
import type { ProfileDto } from '@/types/admin/ProfileTypes';
import type { ApiResponse } from '@/types/CommonTypes';

export const ProfileApi = {
  getMe: async () => {
    const { data } = await apiPrivate.get<ApiResponse<ProfileDto>>('/admin/profiles');
    return data.data;
  },

  updateMe: async (profileData: ProfileDto, file?: File) => {
    const formData = new FormData();
    // Stringify the JSON part
    formData.append(
      'operator',
      new Blob([JSON.stringify(profileData)], { type: 'application/json' }),
    );

    if (file) {
      formData.append('file', file);
    }

    const { data } = await apiPrivate.put<ApiResponse<ProfileDto>>('/admin/profiles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
