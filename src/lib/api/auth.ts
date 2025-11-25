import { type LoginType, type RegisterType } from '@/schemas/auth';
import { apiClient, apiPrivate } from './axios';
import { type RegisterResponse, type UserProfile } from '@/types/auth';
import { isAxiosError } from 'axios'; // 1. Import isAxiosError

// 2. Define the shape of your backend error response
// This matches what you are trying to access: error.response.data.error OR .message
interface ApiErrorResponse {
  error?: string;
  message?: string;
}

/**
 * Handles new user registration
 * POST /user/register
 */
export const registerUser = async (data: RegisterType): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/user/register', data);
    return response.data;
  } catch (error) {
    // 3. Remove ': any', let it be 'unknown'
    if (isAxiosError<ApiErrorResponse>(error)) {
      // TypeScript now knows this is an AxiosError
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    }
    // Handle non-axios errors (e.g., coding errors)
    throw new Error('An unexpected error occurred during registration');
  }
};

/**
 * Handles user login
 * POST /user/login
 */
export const loginUser = async (data: LoginType): Promise<UserProfile> => {
  try {
    const response = await apiClient.post<UserProfile>('/user/login', data);
    return response.data;
  } catch (error) {
    if (isAxiosError<ApiErrorResponse>(error)) {
      throw new Error(error.response?.data?.error || error.message || 'Invalid email or password');
    }
    throw new Error('An unexpected error occurred during login');
  }
};

/**
 * Handles refreshing the access token
 * POST /user/refresh
 */
export const refreshToken = async (): Promise<UserProfile> => {
  try {
    const response = await apiClient.post<UserProfile>('/user/refresh');
    return response.data;
  } catch (error) {
    if (isAxiosError<ApiErrorResponse>(error)) {
      throw new Error(error.response?.data?.message || 'Session expired. Please log in again.');
    }
    throw new Error('Session check failed');
  }
};

/**
 * Fetches the current user's profile
 * GET /user/me
 */
export const getMe = async (): Promise<UserProfile> => {
  try {
    const response = await apiPrivate.get<UserProfile>('/user/me');
    return response.data;
  } catch (error) {
    if (isAxiosError<ApiErrorResponse>(error)) {
      throw new Error(error.response?.data?.message || 'Could not fetch user profile');
    }
    throw new Error('An unexpected error occurred fetching profile');
  }
};

/**
 * Logs the user out by clearing cookies on the backend
 * POST /user/logout
 */
export const logoutUser = async (): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<{ message: string }>('/user/logout');
    return response.data;
  } catch (error) {
    if (isAxiosError<ApiErrorResponse>(error)) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
    throw new Error('An unexpected error occurred during logout');
  }
};
