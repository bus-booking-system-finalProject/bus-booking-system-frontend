export interface UserProfile {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

// Response from POST /user/register
export interface RegisterResponse {
  message: string;
}