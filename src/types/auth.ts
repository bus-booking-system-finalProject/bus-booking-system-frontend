export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface UserProfileResponse {
  user: UserProfile;
}

// Response from POST /user/login
export interface LoginResponse {
  accessToken: string;
  user: UserProfile;
}

// Response from POST /user/register
export interface RegisterResponse {
  user: UserProfile;
}
