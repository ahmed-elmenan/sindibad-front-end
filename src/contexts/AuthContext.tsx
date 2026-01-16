/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import { getToken, removeToken, handleLogoutUser } from '@/services/auth.service';
import { learnerService } from '@/services/learner.service';
import type { User, AuthContextType } from '@/types/Auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateUser = (userData: User | null) => {
    setUser(userData);
    const hasToken = !!getToken();
    setIsAuthenticated(!!userData && hasToken);
  };

  useEffect(() => {
    // Vérifier seulement si un token existe, sans appeler l'API
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const logout = async () => {
    await handleLogoutUser();
    removeToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: updateUser, // Use the new updateUser function
        isAuthenticated,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};