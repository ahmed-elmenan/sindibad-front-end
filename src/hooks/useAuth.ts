import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import type { AuthContextType } from '@/types/Auth';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext) as AuthContextType | undefined;
  if (!context) {
    // Graceful fallback to avoid crashing if hook used outside provider
    // Log a warning to help debugging
    // eslint-disable-next-line no-console
    console.warn('useAuth used outside of AuthProvider — returning fallback values. Wrap your app with AuthProvider.');
    return {
      isAuthenticated: false,
      user: null,
      logout: async () => {},
      setUser: () => {},
      isLoading: false,
      initialized: false,
    } as AuthContextType;
  }
  return context;
};