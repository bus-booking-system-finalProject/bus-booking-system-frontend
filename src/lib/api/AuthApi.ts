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
