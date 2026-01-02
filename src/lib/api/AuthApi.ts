// src/lib/api/auth.ts
import { AxiosError } from 'axios';
import { type LoginType, type RegisterType } from '@/schemas/AuthSchema';
import { apiClient, apiPrivate } from './axios';
import {
  type UserProfile,
  type RegisterResponse,
  type UserProfileResponse,
  type LoginResponse,
} from '@/types/auth';

// Standardized Response Wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Standardized Error Response from Backend GlobalExceptionHandler
interface ApiErrorResponse {
  success: boolean;
  message: string;
}

// Helper to extract error message safely
const getErrorMessage = (err: unknown, defaultMsg: string): string => {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiErrorResponse | undefined;
    return data?.message || err.message || defaultMsg;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return defaultMsg;
};

/**
 * Handles new user registration
 * POST /user/register
 */
export const registerUser = async (data: RegisterType): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>('/user/register', data);
    // Return the inner data or construct a response based on the message
    return response.data.data;
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    throw new Error(error.response?.data?.message || error.message || 'Registration failed');
  }
};

/**
 * Handles user login
 * POST /user/login
 */
export const loginUser = async (data: LoginType): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/user/login', data);
    return response.data.data;
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    throw new Error(error.response?.data?.message || error.message || 'Invalid email or password');
  }
};

/**
 * Handles refreshing the access token
 * POST /user/refresh
 */
export const refreshToken = async (): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/user/refresh');
    return response.data.data;
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    throw new Error(error.response?.data?.message || 'Session expired. Please log in again.');
  }
};

/**
 * Fetches the current user's profile
 * GET /user/me
 */
export const getMe = async (): Promise<UserProfile> => {
  try {
    const response = await apiPrivate.get<ApiResponse<UserProfileResponse>>('/user/me');
    return response.data.data.user;
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    throw new Error(error.response?.data?.message || 'Could not fetch user profile');
  }
};

/**
 * Logs the user out
 * POST /user/logout
 */
export const logoutUser = async (): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<ApiResponse<null>>('/user/logout');
    return { message: response.data.message };
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    throw new Error(error.response?.data?.message || 'Logout failed');
  }
};

// --- NEW: Verify Email ---
export const verifyEmail = async (token: string): Promise<string> => {
  try {
    const response = await apiClient.get<{ message: string }>(`/user/verify-email?token=${token}`);
    return response.data.message;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Verification failed'));
  }
};

// --- NEW: Forgot Password ---
export const forgotPassword = async (email: string): Promise<string> => {
  try {
    const response = await apiClient.post<{ message: string }>('/user/forgot-password', { email });
    return response.data.message;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Request failed'));
  }
};

// --- NEW: Reset Password ---
export const resetPassword = async (token: string, newPassword: string): Promise<string> => {
  try {
    const response = await apiClient.post<{ message: string }>('/user/reset-password', {
      token,
      newPassword,
    });
    return response.data.message;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Reset failed'));
  }
};

// --- NEW: Update Profile ---
export const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const response = await apiPrivate.put<{ data: UserProfileResponse }>('/user/profile', data);
    return response.data.data.user;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Update failed'));
  }
};

// --- NEW: Change Password ---
export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  try {
    await apiPrivate.put('/user/password', { oldPassword, newPassword });
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Change password failed'));
  }
};

// --- NEW: Upload Avatar ---
export const uploadAvatar = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiPrivate.post<{ data: string }>('/user/avatar', formData, {
      headers: {
        // Explicitly setting this ensures the backend identifies the multipart request
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Avatar upload failed'));
  }
};
