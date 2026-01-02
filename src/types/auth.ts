export type UserRole = 'USER' | 'ADMIN' | 'OPERATOR' | 'STAFF';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
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
