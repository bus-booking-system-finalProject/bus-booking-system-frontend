import { createContext, useContext } from 'react';
import { type UserProfile } from '@/types/auth';

// Define the shape of the context
export interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  accessToken: string | null;
  isLoadingUser: boolean;
  login: (user: UserProfile, accessToken: string) => void;
  logout: () => void;
  hasRole: (required: string | string[]) => boolean;
}

// Create the Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
