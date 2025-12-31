export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: number;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: Role;
  createdAt: string;
  enabled: boolean;
}

export interface CreateUserRequest {
  email: string;
  password?: string; // Optional if you auto-generate
  fullName: string;
  role: Role;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string; // Admin can change email
  phoneNumber?: string;
  role?: Role;
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
