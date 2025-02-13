import { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';

export type UserType = 'applicant' | 'company';

export type UserProfile = {
  id: string;
  user_id: string;
  type: UserType;
  company_id?: string;
};

export type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useUserType() {
  const { userProfile } = useAuth();
  return userProfile?.type ?? null;
} 