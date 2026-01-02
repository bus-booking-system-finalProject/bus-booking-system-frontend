import { UserRole } from "./enum/UserRole";

export interface User {
  id: number;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  enabled: boolean;
}

export interface CreateUserRequest {
  email: string;
  password?: string; // Optional if you auto-generate
  fullName: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string; // Admin can change email
  phoneNumber?: string;
  role?: UserRole;
  avatarUrl?: string;
}

export interface UserStatusUpdateRequest {
  enabled: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
